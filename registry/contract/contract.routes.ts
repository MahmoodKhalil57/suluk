/**
 * The contract route (Suluk registry: `contract`) — serves the DERIVED v4 OpenAPI document. Mount it at `/api`:
 * `app.route("/api", contractRoutes())`, so the full path is `GET /api/openapi.json` (the catalog wires this).
 *
 * The document is projected PER CALLER: it reads the request-scoped `scopes` (set by the auth/identity middleware —
 * `c.set("scopes", ...)`) and passes them to `apiDocument`, so `emitV4` HIDES any operation the caller lacks the scope
 * for. An anonymous caller (no scopes) sees only the public surface. The projection is stateless — no DB, no provision.
 */
import { Hono } from "hono";
import { apiDocument } from "../contract";

/** The context variables this route reads — `scopes` is stashed by the identity/scope middleware. */
type Env = { Variables: { scopes?: string[] } };

export function contractRoutes() {
  const r = new Hono<Env>();

  // GET /api/openapi.json — the v4 document projected to what THIS caller may see. Anonymous (no scopes) → the PUBLIC
  // surface only (default to [], never leak the full doc). Build-time tooling calls `apiDocument()` directly for the full doc.
  r.get("/openapi.json", (c) => {
    const document = apiDocument({ scopes: c.get("scopes") ?? [] });
    return c.json(document);
  });

  return r;
}
