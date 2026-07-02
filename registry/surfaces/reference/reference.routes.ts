/**
 * Reference routes (Suluk registry: `reference`) — the v4-native API reference PAGE over the derived contract, rendered by
 * `@suluk/scalar` (our v4-enhanced Scalar: the pinned suluk-forked standalone renders v4 `requests`→operations NATIVELY,
 * and `x-suluk-cost` / `x-suluk-access` surface as badges on each operation). Mount:
 * `app.route("/api/reference", referenceRoutes())`. It renders the SAME v4 document the rest of the platform derives —
 * `apiDocument()` from the contract keystone. Own the wiring; the WHOLE renderer is npm (C052): we never reimplement the
 * HTML, we hand it the doc.
 *
 *   • GET /reference       → the v4-enhanced Scalar page over `apiDocument()` (every declared op), with the "View as" role
 *     projector wired to `/reference/spec` — pick Anonymous or Full and the toolbar re-mounts with that role's projection.
 *   • GET /reference/spec  → the ENRICHED (facet-badged, 3.1-projected) spec the "View as" toolbar re-fetches; `?view=anon`
 *     projects `apiDocument({ scopes: [] })` (the public surface only), any other value the full document.
 *   • GET /reference/:tool → the page FOCUSED on one operation, by its C009 by-name handle. Scalar has no single-op render
 *     entry, so we project the doc to just the pathItem carrying that named request and render THAT (same renderer, one op).
 *     An unknown name falls back to the full page — the reference always renders something.
 *
 * Derived + STATELESS — no schema, no provision. The page is a pure function of the contract.
 */
import { Hono } from "hono";
import type { OpenAPIv4Document } from "@suluk/core";
import { scalarV4Response, enrichedSpec } from "@suluk/scalar";
import type { Bindings } from "../app";
// NO `../contract` import — DECOUPLED. Reference is the contract rendered as a page; the v4 doc projector arrives via the
// `apiDocument` mount-opt (auto-wired from contract — a HARD peer reference `requires`). So reference imports only `../app`
// + `@suluk/*`; the one cross-module edge (contract → reference) is a generate-time wire.

export interface MountReferenceOptions {
  /** wired from contract (auto-injected — reference `requires: ["contract"]`): the v4 doc projector the page renders. */
  apiDocument: (principal?: { scopes: string[] }) => OpenAPIv4Document;
}

// The "View as" roles offered in the Scalar toolbar → the principal each projects the document with. `anon` shows only the
// public surface (an empty scope set hides every scoped op); the default (Full) is the complete document. These are generic —
// scope-set-agnostic — so the module needs no app-specific knowledge of your scope vocabulary.
const VIEWS = [
  { label: "Anonymous", value: "anon" },
  { label: "Full access", value: "full" },
] as const;
const principalFor = (view: string | undefined): { scopes: string[] } | undefined => (view === "anon" ? { scopes: [] } : undefined);

/**
 * Project the v4 document down to the single operation whose C009 by-name handle is `tool` (the key in a pathItem's
 * `requests`). Keeps only the pathItems that host that named request, and within each, only that one request — so the
 * renderer draws exactly one op. Returns `undefined` when no operation carries the name (caller falls back to the full doc).
 */
function focusOn(doc: OpenAPIv4Document, tool: string): OpenAPIv4Document | undefined {
  const paths: OpenAPIv4Document["paths"] = {};
  for (const [uri, item] of Object.entries(doc.paths ?? {})) {
    const requests = item.requests ?? {};
    if (Object.prototype.hasOwnProperty.call(requests, tool)) {
      paths[uri] = { ...item, requests: { [tool]: requests[tool] } };
    }
  }
  return Object.keys(paths).length > 0 ? { ...doc, paths } : undefined;
}

export function referenceRoutes(opts: MountReferenceOptions) {
  const r = new Hono<{ Bindings: Bindings }>();

  // the v4-enhanced Scalar options, shared by the page renders. `specUrl`/`views` arm the "View as" role projector — the
  // toolbar re-mounts Scalar with the enriched spec from `/reference/spec?view=<value>`. `brand` = the app's own doc title.
  const v4Opts = (doc: OpenAPIv4Document) => ({ brand: doc.info?.title, specUrl: "/api/reference/spec", specParam: "view", views: [...VIEWS] });

  // GET /reference → the full v4-enhanced reference over the derived contract document.
  r.get("/", () => {
    const doc = opts.apiDocument();
    return scalarV4Response(doc, v4Opts(doc));
  });

  // GET /reference/spec → the enriched (facet-badged) spec the "View as" toolbar re-fetches, projected to the chosen role.
  // Registered BEFORE `/:tool` so the static path wins.
  r.get("/spec", (c) => {
    const { spec } = enrichedSpec(opts.apiDocument(principalFor(c.req.query("view"))));
    return c.json(spec);
  });

  // GET /reference/:tool → the reference focused on one operation (by name); unknown name → the full page.
  r.get("/:tool", (c) => {
    const doc = opts.apiDocument();
    const focused = focusOn(doc, c.req.param("tool"));
    return scalarV4Response(focused ?? doc, v4Opts(doc));
  });

  return r;
}
