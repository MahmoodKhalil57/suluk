/**
 * Reference routes (Suluk registry: `reference`) — the v4-native API reference PAGE over the derived contract. Mount:
 * `app.route("/api/reference", referenceRoutes())`. It renders the SAME v4 document the rest of the platform derives —
 * `apiDocument()` from the contract keystone — through `@suluk/reference` (the complete v4-native renderer: cost badges,
 * access View-as, signature collisions, hardening, try-it). Own the wiring; the WHOLE renderer is npm (C052): we never
 * reimplement the HTML, we hand it the doc.
 *
 *   • GET /reference       → the full reference over `apiDocument()` (every declared op).
 *   • GET /reference/:tool → the reference FOCUSED on one operation, by its C009 by-name handle. `@suluk/reference` has no
 *     single-op render entry, so we project the doc to just the pathItem carrying that named request and render THAT (same
 *     renderer, one op). An unknown name falls back to the full page — the reference always renders something.
 *
 * Derived + STATELESS — no schema, no provision. The page is a pure function of the contract.
 */
import { Hono } from "hono";
import type { OpenAPIv4Document } from "@suluk/core";
import { referenceResponse } from "@suluk/reference";
import type { Bindings } from "../app";
// NO `../contract` import — DECOUPLED. Reference is the contract rendered as a page; the v4 doc projector arrives via the
// `apiDocument` mount-opt (auto-wired from contract — a HARD peer reference `requires`). So reference imports only `../app`
// + `@suluk/*`; the one cross-module edge (contract → reference) is a generate-time wire.

export interface MountReferenceOptions {
  /** wired from contract (auto-injected — reference `requires: ["contract"]`): the v4 doc projector the page renders. */
  apiDocument: (principal?: { scopes: string[] }) => OpenAPIv4Document;
}

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

  // GET /reference → the full v4 reference over the derived contract document.
  r.get("/", () => referenceResponse(opts.apiDocument()));

  // GET /reference/:tool → the reference focused on one operation (by name); unknown name → the full page.
  r.get("/:tool", (c) => {
    const tool = c.req.param("tool");
    const doc = opts.apiDocument();
    const focused = focusOn(doc, tool);
    return referenceResponse(focused ?? doc);
  });

  return r;
}
