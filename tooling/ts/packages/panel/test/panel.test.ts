import { test, expect, describe } from "bun:test";
import { fieldsOf, titleField, humanize, entityModels, renderInput, renderForm, renderList, renderShell, panelApp, mediaEditor } from "../src/index";

const productSchema = {
  type: "object",
  required: ["name", "priceCents"],
  properties: {
    id: { type: "integer" },
    name: { type: "string" },
    slug: { type: "string" },
    description: { anyOf: [{ type: "string" }, { type: "null" }] },
    body: { anyOf: [{ type: "string" }, { type: "null" }] },
    priceCents: { type: "integer" },
    categoryId: { anyOf: [{ type: "integer" }, { type: "null" }] },
    status: { type: "string", enum: ["draft", "published"] },
    priority: { type: "integer", enum: [1, 2, 3] },
    imageUrl: { anyOf: [{ type: "string" }, { type: "null" }] },
    isActive: { type: "boolean" },
    createdAt: { type: "integer" },
    contactEmail: { type: "string" },
  },
};
const entities = new Set(["Product", "Category"]);

describe("field-type inference", () => {
  const fields = fieldsOf(productSchema, entities);
  const by = (n: string) => fields.find((f) => f.name === n)!;
  test("maps each property to the right Payload-style widget", () => {
    expect(by("name").type).toBe("text");
    expect(by("description").type).toBe("textarea");
    expect(by("body").type).toBe("richtext");
    expect(by("priceCents").type).toBe("number");
    expect(by("status").type).toBe("select");
    expect(by("status").options).toEqual(["draft", "published"]);
    expect(by("status").optionType).toBe("string");
    expect(by("priority").type).toBe("select"); // a NUMERIC enum is still a select…
    expect(by("priority").options).toEqual(["1", "2", "3"]);
    expect(by("priority").optionType).toBe("number"); // …but carries its scalar type so the form submits numbers, not "1"
    expect(by("isActive").type).toBe("boolean");
    expect(by("imageUrl").type).toBe("media"); // image/cover/avatar/… → media (upload widget), not a plain url
    expect(by("contactEmail").type).toBe("email");
    expect(by("createdAt").type).toBe("datetime");
  });
  test("relationship: categoryId → Category (because Category is an entity)", () => {
    expect(by("categoryId").type).toBe("relationship");
    expect(by("categoryId").relationTo).toBe("Category");
  });
  test("required (non-nullable) + readOnly + nullable flags", () => {
    expect(by("name").required).toBe(true);
    expect(by("priceCents").required).toBe(true);
    expect(by("description").nullable).toBe(true);
    expect(by("id").readOnly).toBe(true);
    expect(by("createdAt").readOnly).toBe(true);
  });
  test("humanize + titleField", () => {
    expect(humanize("coverImageUrl")).toBe("Cover Image URL");
    expect(humanize("categoryId")).toBe("Category");
    expect(titleField(fields)).toBe("name");
  });
});

describe("entityModels from a document", () => {
  const doc = {
    components: { schemas: { Product: productSchema, ProblemDetails: { type: "object", properties: { title: { type: "string" } } } } },
    paths: {
      product: { requests: { listProduct: {}, createProduct: {} } },
      "product/{id}": { requests: { getProduct: {}, updateProduct: {}, deleteProduct: {} } },
    },
  };
  const ms = entityModels(doc as never);
  test("only CRUD-managed entities; access derived from present ops; path normalized", () => {
    expect(ms.map((m) => m.name)).toEqual(["Product"]); // ProblemDetails has no listProblemDetails → excluded
    expect(ms[0].path).toBe("/product");
    expect(ms[0].access).toEqual({ list: true, create: true, update: true, delete: true });
  });
  test("a projected doc without create/delete ops yields a read-only-ish model", () => {
    const ro = entityModels({ components: doc.components, paths: { product: { requests: { listProduct: {} } }, "product/{id}": { requests: { getProduct: {} } } } } as never);
    expect(ro[0].access).toEqual({ list: true, create: false, update: false, delete: false });
  });
});

describe("renderers produce HTML", () => {
  const fields = fieldsOf(productSchema, entities);
  test("renderInput per type", () => {
    expect(renderInput(fields.find((f) => f.name === "isActive")!)).toContain("pf-switch");
    expect(renderInput(fields.find((f) => f.name === "status")!)).toContain("<option value=\"draft\"");
    expect(renderInput(fields.find((f) => f.name === "categoryId")!)).toContain('data-rel="Category"');
    const rt = renderInput(fields.find((f) => f.name === "body")!);
    expect(rt).toContain("data-rt");                 // the markdown editor wrapper
    expect(rt).toContain('data-md="bold"');           // toolbar
    expect(rt).toContain('data-rt-tab="preview"');    // Write/Preview
    expect(rt).toContain('name="body"');              // the textarea is still the form input
    const media = renderInput(fields.find((f) => f.name === "imageUrl")!);
    expect(media).toContain("data-media");            // upload widget
    expect(media).toContain("data-file");             // file picker
    expect(media).toContain('name="imageUrl"');       // url input is the form field
  });
  const model = entityModels({ components: { schemas: { Product: productSchema } }, paths: { product: { requests: { listProduct: {}, createProduct: {}, updateProduct: {}, deleteProduct: {} } } } } as never)[0];
  test("form + list + shell render without throwing", () => {
    const form = renderForm(model, { basePath: "/panel", relPaths: { Category: "/category" }, canDelete: true });
    expect(form).toContain('id="pf-form"');
    expect(form).toContain("pf-meta");
    expect(form).toContain("data-rt"); // Product has a rich-text `body` → the editor is present + its init script runs
    const lst = renderList(model, { basePath: "/panel" });
    expect(lst).toContain("pf-table");
    expect(lst).toContain("+ New Product");
    const shell = renderShell({ title: "saasuluk", brand: "saasuluk", basePath: "/panel", entities: [{ name: "Product" }], active: "Product", heading: "Product", body: lst });
    expect(shell).toContain("<aside class=\"pf-side\"");
    expect(shell).toContain("Collections");
  });
  test("media preview never emits a dangerous-scheme href/src (stored-XSS guard)", () => {
    // A stored javascript:/data: URL must NOT become a clickable link or src — render inert (escaped) text instead.
    for (const bad of ["javascript:alert(1)", "data:text/html,<script>alert(1)</script>", "vbscript:msgbox(1)", "//evil.example/x.png", "/\\evil.com"]) {
      const html = mediaEditor("imageUrl", bad);
      expect(html).not.toContain(`href="${bad}"`);
      expect(html).not.toContain(`href="javascript:`);
      expect(html).not.toContain(`src="javascript:`);
      expect(html).not.toContain("<script>"); // the value is escaped, never reflected as live markup
    }
    // …but legitimate absolute + app-relative URLs still render as a link / image.
    expect(mediaEditor("imageUrl", "/media/abc123.png")).toContain('src="/media/abc123.png"');
    expect(mediaEditor("imageUrl", "https://cdn.example/x.webp")).toContain('src="https://cdn.example/x.webp"');
    expect(mediaEditor("imageUrl", "https://example.com/page")).toContain('href="https://example.com/page"');
  });
  test("panelApp builds a Hono app", () => {
    const a = panelApp({ document: { components: { schemas: { Product: productSchema } }, paths: { product: { requests: { listProduct: {} } } } } as never, authorize: () => true });
    expect(typeof a.fetch).toBe("function");
  });
});

describe("dashboard framework — stats, groups, custom sections", () => {
  const doc = { components: { schemas: { Product: productSchema } }, paths: { product: { requests: { listProduct: {}, createProduct: {}, updateProduct: {}, deleteProduct: {} } } } } as never;
  const opts = {
    document: doc, basePath: "/dashboard", title: "saasuluk", authorize: () => true, homeLabel: "Home", homeHeading: "Welcome back",
    stats: [{ label: "Orders", value: 3, hint: "all time", href: "/dashboard/Product" }, { label: "Spent", value: "$42" }],
    sections: [{ id: "profile", label: "Profile", summary: "Your details", render: () => '<div class="pf-section" id="profile-body">hi</div>' }],
    groups: [{ title: "Account", sections: ["profile"] }, { title: "Commerce", entities: ["Product"] }],
  };
  test("home renders stat cards + grouped entity/section cards + custom heading", async () => {
    const app = panelApp(opts as never);
    const html = await (await app.request("/dashboard")).text();
    expect(html).toContain("pf-stats");
    expect(html).toContain("Orders");
    expect(html).toContain(">$42<");                       // a non-link stat value
    expect(html).toContain("Welcome back");                 // homeHeading
    expect(html).toContain(">Home<");                       // homeLabel on the home nav link
    expect(html).toContain('href="/dashboard/s/profile"');  // section card + nav
    expect(html).toContain("Account");                      // group title
    expect(html).toContain("Commerce");
  });
  test("a custom section route renders its body inside the shell", async () => {
    const app = panelApp(opts as never);
    const res = await app.request("/dashboard/s/profile");
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('id="profile-body"');           // host-rendered section body
    expect(html).toContain("pf-side");                       // …wrapped in the panel shell
    expect((await app.request("/dashboard/s/nope")).status).toBe(404); // unknown section
  });
  test("the section route (static /s/) does not collide with the entity form route", async () => {
    const app = panelApp(opts as never);
    expect((await app.request("/dashboard/s/profile")).status).toBe(200); // section, not entity "s" action "profile"
    expect((await app.request("/dashboard/Product/new")).status).toBe(200); // entity form still works
  });
  test("sections are gated by authorize like everything else", async () => {
    const app = panelApp({ ...opts, authorize: () => false } as never);
    expect((await app.request("/dashboard/s/profile")).status).toBe(403);
  });
});

describe("bespoke + role-adaptive dashboard (the /dashboard ≠ /superadmin distinction)", () => {
  const d2 = { components: { schemas: { Product: productSchema } }, paths: { product: { requests: { listProduct: {} } } } } as never;
  test("a custom `home` replaces the auto card-grid (stats still render above it)", async () => {
    const app = panelApp({ document: d2, basePath: "/dashboard", authorize: () => true,
      stats: [{ label: "Orders", value: 2 }], home: () => '<div id="product-overview">Welcome back!</div>' } as never);
    const html = await (await app.request("/dashboard")).text();
    expect(html).toContain("pf-stats");                  // stats above
    expect(html).toContain('id="product-overview"');     // the bespoke overview
    expect(html).toContain("Welcome back!");
    expect(html).not.toContain("fields ·");              // the auto entity card-grid (e.g. "N fields · …") is replaced
  });
  test("sections + groups can be FUNCTIONS of the request → the dashboard adapts to who is logged in", async () => {
    const roleApp = (role: string) => panelApp({
      document: d2, basePath: "/dashboard", authorize: () => true,
      sections: () => role === "admin"
        ? [{ id: "ops", label: "Ops", render: () => "<div id=ops>ops</div>" }]
        : [{ id: "profile", label: "Profile", render: () => "<div id=profile>me</div>" }],
      groups: () => [{ title: role === "admin" ? "Operations" : "Account", sections: role === "admin" ? ["ops"] : ["profile"] }],
    } as never);
    expect(await (await roleApp("admin").request("/dashboard")).text()).toContain("Operations");
    expect((await roleApp("admin").request("/dashboard/s/ops")).status).toBe(200);
    expect((await roleApp("admin").request("/dashboard/s/profile")).status).toBe(404); // admin doesn't get the user section
    expect(await (await roleApp("user").request("/dashboard")).text()).toContain("Account");
    expect((await roleApp("user").request("/dashboard/s/profile")).status).toBe(200);
    expect((await roleApp("user").request("/dashboard/s/ops")).status).toBe(404); // …and vice-versa
  });
});
