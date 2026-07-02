import { test, expect, describe } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseDocument } from "@suluk/core";
import { validate31 } from "@suluk/openapi-compat";
import { scalarHtml, scalarResponse, enrichFacetBadges, enrichedSpec, enrichedV4, scalarV4Html, SCALAR_VERSION } from "../src/index";

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

describe("route economics — cost · settlement · dynamic components · triggered events", () => {
  // an AI-transcription route: a fixed floor + DYNAMIC per-token (model) + per-mb (file) cost, settled by CREDIT, that
  // TRIGGERS a background webhook-received cost on `billingSync`. billingSync is the triggered event (non-sync cost).
  const doc = {
    openapi: "4.0.0-candidate", info: { title: "Econ", version: "1" },
    paths: {
      transcribe: { requests: { transcribe: {
        method: "POST", responses: { ok: { status: "200", description: "OK" } },
        "x-suluk-access": { requires: "authenticated" },
        "x-suluk-cost": {
          estimateMicroUsd: 500,
          components: [
            { source: "compute", basis: "per-call", microUsd: 500, description: "request overhead" },
            { source: "openai:whisper", basis: "per-1k-tokens", microUsd: 6000, description: "the AI model" },
            { source: "r2-egress", basis: "per-mb", microUsd: 90, description: "audio file size" },
          ],
          settlement: { method: "credit", credits: 3 },
        },
      } } },
      "webhooks/billing": { requests: { billingSync: {
        method: "POST", responses: { ok: { status: "200", description: "OK" } },
        "x-suluk-cost": { estimateMicroUsd: 200, trigger: "webhook-received", triggerRef: "transcribe", attribution: { strategy: "event-expression", trust: "verified" } },
      } } },
    },
  } as never;

  const detail = () => (enrichedV4(doc).spec as any).paths.transcribe.requests.transcribe.description as string;

  test("badges: cost (with the ＋ metered marker) + settlement render alongside access", () => {
    const badges = ((enrichedV4(doc).spec as any).paths.transcribe.requests.transcribe["x-badges"] as { name: string }[]).map((b) => b.name);
    expect(badges.some((n) => n.startsWith("💰") && n.includes("＋"))).toBe(true); // fixed floor + a metered ＋
    expect(badges.some((n) => n.includes("💳 credits"))).toBe(true);              // the settlement badge
  });

  test("the DYNAMIC / metered components render with their rate + unit + description", () => {
    const d = detail();
    expect(d).toContain("+ 6000µ$ / 1k tokens");  // the AI-model per-1k-tokens rate
    expect(d).toContain("the AI model");
    expect(d).toContain("+ 90µ$ / MB");            // the file-size per-mb rate
    expect(d).toContain("audio file size");
  });

  test("SETTLEMENT (how it's paid) renders — credits debited", () => {
    expect(detail()).toContain("**Settlement** — 💳 credits · 3 credits debited per call");
  });

  test("an INFRA-ONLY route shows a real weighed µ$ (not 0/metered) — the badge + the infra breakdown", () => {
    // most routes cost via `infra` (symbolic multipliers), not a declared estimate — scalar must WEIGH them or show ~0.
    const mk = { openapi: "4.0.0-candidate", info: { title: "I", version: "1" }, paths: { p: { requests: { read: {
      method: "GET", responses: { ok: { status: "200", description: "OK" } },
      "x-suluk-cost": { components: [], infra: { "worker.request": 1, "d1.read": 20 }, settlement: { method: "rate-limited" } },
    } } } } } as never;
    const op = (enrichedV4(mk).spec as any).paths.p.requests.read;
    const costBadge = (op["x-badges"] as { name: string }[]).find((b) => b.name.startsWith("💰"));
    expect(costBadge).toBeDefined();
    expect(costBadge!.name).not.toContain("metered"); // it has a real number now
    expect(costBadge!.name).toMatch(/💰 0\.32µ\$/); // 1×0.3 (worker) + 20×0.001 (d1.read) = 0.32 µ$
    expect(op.description).toContain("infra:"); // the weighed breakdown line
    expect(op.description).toContain("worker.request");
  });

  test("passing live `weights` overrides the default snapshot", () => {
    const mk = { openapi: "4.0.0-candidate", info: { title: "I", version: "1" }, paths: { p: { requests: { r: {
      method: "GET", responses: { ok: { status: "200", description: "OK" } }, "x-suluk-cost": { components: [], infra: { "worker.request": 2 } },
    } } } } } as never;
    const op = (enrichedV4(mk, { weights: { "worker.request": 5 } }).spec as any).paths.p.requests.r;
    expect((op["x-badges"] as { name: string }[]).find((b) => b.name.startsWith("💰"))!.name).toMatch(/10µ\$/); // 2 × 5
  });

  test("the C067 payment methods render HONESTLY — subscription/trust are user-paid, not 'operator absorbs'", () => {
    const mk = (method: string) => ({
      openapi: "4.0.0-candidate", info: { title: "S", version: "1" },
      paths: { p: { requests: { op: { method: "POST", responses: { ok: { status: "200", description: "OK" } }, "x-suluk-cost": { estimateMicroUsd: 5000, settlement: { method } } } } } },
    }) as never;
    const d = (method: string) => (enrichedV4(mk(method)).spec as any).paths.p.requests.op.description as string;
    const badgeColor = (method: string) => ((enrichedV4(mk(method)).spec as any).paths.p.requests.op["x-badges"] as { name: string; color: string }[]).find((b) => b.name.includes(method) || /subscription|net-terms|lead/.test(b.name))?.color;
    // subscription is plan-billed — NOT operator-absorbed, and its badge is NOT the green free-color
    expect(d("subscription")).toContain("recovered against the user's plan allowance");
    expect(d("subscription")).not.toContain("the operator absorbs the cost");
    expect(badgeColor("subscription")).not.toContain("green");
    // trust is post-pay / net-terms — user IS billed later
    expect(d("trust")).toContain("post-pay");
    expect(badgeColor("trust")).not.toContain("green");
    // lead genuinely is operator-absorbed (acquisition)
    expect(d("lead")).toContain("acquisition");
  });

  test("the TRIGGERED cost-bearing events render on the route that fires them (reverse of triggerRef)", () => {
    expect(detail()).toContain("**Triggers** —");
    expect(detail()).toContain("`billingSync`");
    expect(detail()).toContain("webhook-received");
  });

  test("the triggered event ITSELF shows when its cost accrues + who pays", () => {
    const bs = (enrichedV4(doc).spec as any).paths["webhooks/billing"].requests.billingSync.description as string;
    expect(bs).toContain("**Accrues** — on `webhook-received`");
    expect(bs).toContain("via `transcribe`");
    expect(bs).toContain("billed to _event-expression_");
  });

  test("the 3.1 downgrade path renders the same economics (settlement + dynamic + triggers)", () => {
    const d = (enrichedSpec(doc).spec as any).paths["/transcribe"].post.description as string;
    expect(d).toContain("💳 credits");
    expect(d).toContain("+ 6000µ$ / 1k tokens");
    expect(d).toContain("`billingSync`");
  });
});

describe("internal routes — the 🔒 Internal badge + Internal group", () => {
  const doc = {
    openapi: "4.0.0-candidate", info: { title: "I", version: "1" },
    paths: { "email/send": { requests: { sendEmail: { method: "POST", tags: ["Internal", "Email"], "x-suluk-internal": true, responses: { ok: { status: "200", description: "OK" } } } } } },
  } as never;

  test("an x-suluk-internal op gets the 🔒 Internal badge (v4 + 3.1)", () => {
    const v4 = (enrichedV4(doc).spec as any).paths["email/send"].requests.sendEmail;
    expect((v4["x-badges"] as { name: string }[]).some((b) => b.name === "🔒 Internal")).toBe(true);
    const op31 = (enrichedSpec(doc).spec as any).paths["/email/send"].post;
    expect((op31["x-badges"] as { name: string }[]).some((b) => b.name === "🔒 Internal")).toBe(true);
  });

  test("the Internal tag rides through so Scalar's sidebar sections it under 'Internal'", () => {
    const op31 = (enrichedSpec(doc).spec as any).paths["/email/send"].post;
    expect(op31.tags).toContain("Internal");
  });
});

describe("per-route hardening report (@suluk/harden → a native collapsible <details> per op)", () => {
  // createThing takes an UNBOUNDED body (`contentSchema: true` = permits ANY) → a high-severity finding, low grade.
  // listThing takes no input → clean (grade A, no findings).
  const doc = {
    openapi: "4.0.0-candidate", info: { title: "H", version: "1" },
    paths: { thing: { requests: {
      createThing: { method: "POST", contentSchema: true, responses: { ok: { status: "200", description: "OK" } } },
      listThing: { method: "GET", responses: { ok: { status: "200", description: "OK" } } },
    } } },
  } as never;

  test("each op gets a collapsible <details> hardening report with its grade + score (v4-native path)", () => {
    const create = (enrichedV4(doc).spec as any).paths.thing.requests.createThing;
    expect(create.description).toContain("<details>");
    expect(create.description).toContain("<summary>");
    expect(create.description).toContain("🛡 Hardening");
    expect(create.description).toMatch(/grade [A-F] · \d+\/100/);
  });

  test("the findings are listed (severity · schema path · message · fix) for an unbounded input", () => {
    const create = (enrichedV4(doc).spec as any).paths.thing.requests.createThing;
    expect(create.description).toContain("<li>");
    expect(create.description).toContain("permits ANY"); // the `no-any` finding message for `contentSchema: true`
    expect(create.description).toContain("fix:");
  });

  test("a clean op reports no findings", () => {
    const list = (enrichedV4(doc).spec as any).paths.thing.requests.listThing;
    expect(list.description).toContain("🛡 Hardening");
    expect(list.description).toContain("no findings");
  });

  test("the 3.1 downgrade path (enrichedSpec) also appends the per-op hardening report", () => {
    const create = (enrichedSpec(doc).spec as any).paths["/thing"].post;
    expect(create.description).toContain("🛡 Hardening");
    expect(create.description).toContain("<details>");
  });

  test("hardening:false skips the audit + the report", () => {
    const create = (enrichedV4(doc, { hardening: false }).spec as any).paths.thing.requests.createThing;
    expect(create.description ?? "").not.toContain("🛡 Hardening");
  });

  test("the intro carries the GLOBAL doc-level hardening report (combined grade + every dimension)", () => {
    const info = (enrichedV4(doc).spec as any).info;
    expect(info.description).toContain("Contract hardening"); // the collapsible global report
    expect(info.description).toMatch(/overall grade [A-F]/);
    expect(info.description).toContain("security"); // the security · readiness · cost breakdown
    expect(info.description).toContain("Cost coverage");
    expect(info.description).toContain("<details>"); // collapsible
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

  test("renders NO custom top bar — the v4 chrome (insights + View-as) lives in Scalar's OWN slots", () => {
    const { html } = scalarV4Html(v4doc, {
      brand: "saasuluk", cdn: "/vendor/scalar/standalone.js",
      specUrl: "/reference/spec", views: [{ label: "Anonymous", value: "anon" }, { label: "Admin", value: "admin" }],
      insightsUrl: "/reference/insights",
    });
    expect(html).not.toContain("sv4-bar");               // the bolted-on top bar is GONE
    expect(html).not.toContain("<header");               // no custom chrome above Scalar
    expect(html).not.toContain("#6366f1");               // no hardcoded brand colour (theme-native)
    expect(html).toContain("x-suluk-views");             // the View-as projector is handed to the fork (sidebar-start)
    expect(html).toContain("anon");                      // …with the role options (rendered by the fork, themed)
    expect(html).toContain("suluk:viewas");              // the sidebar select dispatches this; the host re-mounts on it
    expect(html).toContain('"/reference/spec"');         // re-fetched per role
    expect(html).toContain("x-suluk-insights");          // insights URL → fork renders them in content-start
    expect(html).toContain("/vendor/scalar/standalone.js");
    expect(html).toContain("Scalar.createApiReference");
    expect(html).toContain("x-badges");                  // v4 facet superpowers baked into the spec
  });

  test("customCss defaults to empty so the chosen Scalar theme drives every colour (no accent override)", () => {
    const { html } = scalarV4Html(v4doc, { brand: "x" });
    const cfg = extractObjAfter(html, "CFG =");
    expect(cfg.customCss).toBe("");
    expect(html).not.toContain("--scalar-color-accent:#"); // we never hardcode the theme accent
  });

  test("with no views/specUrl, no View-as options are handed to the fork (still mounts)", () => {
    const { html } = scalarV4Html(v4doc, { brand: "x" });
    expect(html).toContain("VIEWS = []");                 // no role options → fork renders no sidebar projector
    expect(html).toContain("Scalar.createApiReference");
  });

  test("View-as options are only handed over when a specUrl exists to re-fetch from", () => {
    const withSpec = scalarV4Html(v4doc, { views: [{ label: "Anonymous", value: "anon" }], specUrl: "/s" }).html;
    const noSpec = scalarV4Html(v4doc, { views: [{ label: "Anonymous", value: "anon" }] }).html; // views but no specUrl
    expect(withSpec).toContain('"value":"anon"');
    expect(noSpec).toContain("VIEWS = []");
  });

  test("enables showOperationId so the v4 request-NAME (operationId) renders as Scalar's own operation badge", () => {
    const { html } = scalarV4Html(v4doc, { brand: "saasuluk" });
    expect(html).toContain('"showOperationId":true');
  });

  test("showOperationId stays overridable via configuration", () => {
    const { html } = scalarV4Html(v4doc, { brand: "x", configuration: { showOperationId: false } });
    expect(html).toContain('"showOperationId":false');
  });

  test("scalarV4Html feeds the forked Scalar the NATIVE v4 doc (requests-shape), not the 3.1 downgrade", () => {
    const { html } = scalarV4Html(v4doc, { brand: "saasuluk" });
    const content = extractObjAfter(html, "INITIAL =");
    expect(content.openapi).toBe("4.0.0-candidate");                 // fed AS v4 (drives the 4.0.0 version badge)
    expect(content.paths.product.requests.listProduct).toBeDefined(); // v4 requests-shape, NOT paths./product.get
    expect(content.paths.product.requests.listProduct["x-badges"]).toBeDefined(); // facets stamped on the request
  });
});

describe("enrichedV4 — native v4 facet enrichment (no downgrade, fed to the forked Scalar)", () => {
  const v4doc = {
    openapi: "4.0.0-candidate", info: { title: "saasuluk", version: "1" },
    paths: { product: { requests: { listProduct: {
      method: "GET", responses: { ok: { status: "200", description: "OK" } },
      "x-suluk-cost": { components: [{ source: "db-read", basis: "per-call", microUsd: 8 }] },
      "x-suluk-access": { requires: "admin" },
    } } } },
  } as never;

  test("stamps x-badges + facet detail on the v4 REQUEST, keeping the doc in v4 shape", () => {
    const { spec } = enrichedV4(v4doc);
    expect((spec as Record<string, unknown>).openapi).toBe("4.0.0-candidate"); // NOT downgraded
    const req = (spec as { paths: { product: { requests: { listProduct: Record<string, unknown> } } } }).paths.product.requests.listProduct;
    expect(req["x-badges"]).toBeDefined();
    expect(String(req.description)).toContain("**Cost**");
    expect(String(req.description)).toContain("db-read 8µ$");
  });

  test("prepends a v4 intro that counts REQUESTS (not 3.x methods)", () => {
    const { spec } = enrichedV4(v4doc);
    expect(String((spec as { info: { description: string } }).info.description)).toContain("1 of 1 operations carry a declared cost");
  });

  test("does not mutate the caller's document", () => {
    const before = JSON.stringify(v4doc);
    enrichedV4(v4doc);
    expect(JSON.stringify(v4doc)).toBe(before);
  });

  test("facetBadges:false leaves the requests un-enriched", () => {
    const { spec } = enrichedV4(v4doc, { facetBadges: false });
    expect((spec as { paths: { product: { requests: { listProduct: Record<string, unknown> } } } }).paths.product.requests.listProduct["x-badges"]).toBeUndefined();
  });
});
