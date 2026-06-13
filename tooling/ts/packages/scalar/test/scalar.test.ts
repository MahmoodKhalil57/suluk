import { test, expect, describe } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseDocument } from "@suluk/core";
import { validate31 } from "@suluk/openapi-compat";
import { scalarHtml, scalarResponse, enrichFacetBadges, enrichedSpec, scalarV4Html, SCALAR_VERSION } from "../src/index";

const petstore = parseDocument(
  readFileSync(join(import.meta.dir, "..", "..", "core", "test", "conformance", "valid", "01-petstore.yaml"), "utf8"),
);

/** Extract the first balanced `{...}` object literal after a marker, undoing the <-escaping. */
function extractObjAfter(html: string, marker: string): any {
  const start = html.indexOf("{", html.indexOf(marker));
  let depth = 0, inStr = false, esc = false, i = start;
  for (; i < html.length; i++) {
    const c = html[i];
    if (inStr) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === '"') inStr = false; }
    else if (c === '"') inStr = true;
    else if (c === "{") depth++;
    else if (c === "}" && --depth === 0) { i++; break; }
  }
  return JSON.parse(html.slice(start, i).replace(/\\u003c/g, "<"));
}

describe("@suluk/scalar renders a v4 doc", () => {
  const { html } = scalarHtml(petstore);

  test("produces a self-contained page that loads Scalar from the CDN", () => {
    expect(html).toContain("<!doctype html>");
    expect(html).toContain("@scalar/api-reference");
    expect(html).toContain("Scalar.createApiReference('#app'");
  });

  test("uses the document title and embeds the spec as inline content", () => {
    expect(html).toContain("Petstore");
    expect(html).toContain('"openapi":"3.1.0"');
    expect(html).toContain('"content":');
  });

  test("the embedded spec is valid OpenAPI 3.1 (so Scalar will render it)", () => {
    const spec = extractObjAfter(html, "createApiReference").content;
    expect(validate31(spec).valid).toBe(true);
  });

  test("neutralizes </script> breakout in embedded content", () => {
    const evil = parseDocument(`
openapi: 4.0.0-candidate
info: { title: "x</script><script>alert(1)</script>", version: "1" }
paths: {}
`);
    expect(scalarHtml(evil).html).not.toContain("</script><script>alert(1)");
  });

  test("scalarResponse returns text/html", () => {
    const r = scalarResponse(petstore);
    expect(r.headers.get("content-type")).toContain("text/html");
  });

  test("Scalar is PINNED (we own the version — no @latest drift)", () => {
    expect(html).toContain(`@scalar/api-reference@${SCALAR_VERSION}`);
    expect(html).not.toContain("@scalar/api-reference\"");   // never bare/@latest
  });
});

describe("v4 facets become Scalar badges (the first phase of Scalar-for-v4)", () => {
  const v4doc = {
    openapi: "4.0.0-candidate", info: { title: "Facets", version: "1" },
    paths: { product: { requests: { listProduct: {
      method: "GET", responses: { ok: { status: "200", description: "OK" } },
      "x-suluk-cost": { components: [{ source: "db-read", basis: "per-call", microUsd: 8 }] },
      "x-suluk-access": { requires: "admin", scope: "owner" },
    } } } },
  } as never;

  test("x-suluk-cost + x-suluk-access render as x-badges on the operation", () => {
    const { html } = scalarHtml(v4doc);
    const op = extractObjAfter(html, "createApiReference").content.paths["/product"].get;
    expect(op["x-badges"]).toBeDefined();
    const names = (op["x-badges"] as { name: string }[]).map((b) => b.name);
    expect(names.some((n) => n.includes("Admin") && n.includes("owner"))).toBe(true); // access facet → badge
    expect(names.some((n) => n.includes("8µ$"))).toBe(true);                            // cost facet → badge
  });

  test("expanding an op reveals the cost breakdown + access detail in its description", () => {
    const op = extractObjAfter(scalarHtml(v4doc).html, "createApiReference").content.paths["/product"].get;
    expect(op.description).toContain("**Access**");
    expect(op.description).toContain("Admin only");
    expect(op.description).toContain("owner-scoped");
    expect(op.description).toContain("**Cost**");
    expect(op.description).toContain("db-read 8µ$"); // the per-source breakdown
  });

  test("a v4 contract intro + cost-coverage tally is prepended to info.description", () => {
    const info = extractObjAfter(scalarHtml(v4doc).html, "createApiReference").content.info;
    expect(info.description).toContain("Suluk v4 contract");
    expect(info.description).toContain("1 of 1 operations carry a declared cost");
  });

  test("facetBadges:false leaves the spec un-enriched", () => {
    const { html } = scalarHtml(v4doc, { facetBadges: false });
    const c = extractObjAfter(html, "createApiReference").content;
    expect(c.paths["/product"].get["x-badges"]).toBeUndefined();
    expect(c.paths["/product"].get.description ?? "").not.toContain("**Cost**");
    expect(c.info.description ?? "").not.toContain("Suluk v4 contract");
  });

  test("enrichFacetBadges is a no-op on an op with no facets", () => {
    const spec = { paths: { "/x": { get: { responses: {} } } } };
    enrichFacetBadges(spec);
    expect((spec.paths["/x"].get as Record<string, unknown>)["x-badges"]).toBeUndefined();
  });

  test("enrichedSpec returns the facet-enriched 3.1 spec (without rendering a page)", () => {
    const { spec } = enrichedSpec(v4doc);
    const op = (spec as { paths: Record<string, Record<string, Record<string, unknown>>> }).paths["/product"].get;
    expect(op["x-badges"]).toBeDefined();
    expect(String(op.description)).toContain("**Cost**");
  });
});

describe("scalarV4Html — the v4 REFERENCE (fork) with all suluk superpowers", () => {
  const v4doc = {
    openapi: "4.0.0-candidate", info: { title: "saasuluk", version: "1" },
    paths: { product: { requests: { listProduct: {
      method: "GET", responses: { ok: { status: "200", description: "OK" } },
      "x-suluk-cost": { components: [{ source: "db-read", basis: "per-call", microUsd: 8 }] },
      "x-suluk-access": { requires: "admin" },
    } } } },
  } as never;

  test("renders the suluk toolbar + role view-as projector + native-renderer link, and mounts Scalar with the enriched spec", () => {
    const { html } = scalarV4Html(v4doc, {
      brand: "saasuluk", cdn: "/vendor/scalar/standalone.js",
      specUrl: "/reference/spec", views: [{ label: "Anonymous", value: "anon" }, { label: "Admin", value: "admin" }],
      insightsUrl: "/reference/insights",
    });
    expect(html).toContain("sv4-bar");                  // the suluk toolbar
    expect(html).toContain("OpenAPI v4");               // it announces v4
    expect(html).toContain('id="sv4-as"');              // the View-as role projector
    expect(html).toContain('value="anon"');
    expect(html).toContain('"/reference/spec"');         // the projector re-fetches this per role
    expect(html).toContain('"/reference/insights"');     // the superpowers URL handed to the forked Scalar…
    expect(html).toContain("x-suluk-insights");          // …via config → the fork renders them INLINE via content-start
    expect(html).not.toContain('id="sv4-drawer"');       // the bolt-on drawer is retired
    expect(html).toContain("/vendor/scalar/standalone.js"); // self-hosted bundle
    expect(html).toContain("Scalar.createApiReference"); // mounts Scalar
    expect(html).toContain("x-badges");                 // …with the v4 facet superpowers baked into the spec
  });

  test("with no views/specUrl, the toolbar omits the projector but still brands + mounts", () => {
    const { html } = scalarV4Html(v4doc, { brand: "x" });
    expect(html).toContain("sv4-bar");
    expect(html).not.toContain('id="sv4-as"');
  });
});
