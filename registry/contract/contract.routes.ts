/**
 * The contract mount (Suluk registry: `contract`) — a MIDDLEWARE mount that installs, in one place, the two contract-derived
 * concerns on `/api/*`:
 *   1. the SCOPE GATE (`enforceApiKeyScope`) — a keyed caller is restricted to the scopes the contract declares per op;
 *      sessions pass through. It runs AFTER the auth `identity`/`apiKeyAuth` middleware (which set `keyId`/`scopes`).
 *   2. `GET /api/openapi.json` — the v4 document PROJECTED to the caller's scopes (anonymous → the public surface).
 * Wired into the generated entry as `mountContract(app)`. Own the wiring; @suluk/hono derives the doc + facets.
 */
import type { Hono, MiddlewareHandler } from "hono";
import type { Bindings } from "../app";
import { apiDocument, enforceApiKeyScope, validateRequest } from "../contract";

export function mountContract<T extends Hono<{ Bindings: Bindings }>>(app: T): T {
  // the scope gate on every /api/* request (after auth's caller-resolution middleware set keyId/scopes).
  app.use("/api/*", enforceApiKeyScope as MiddlewareHandler);
  // the contract-derived body gate — validate a write op's JSON body against its declared request.json schema. AFTER the
  // scope gate so a missing-scope 403 precedes a bad-body 400; only tightens ops that DECLARE a schema (others pass through).
  app.use("/api/*", validateRequest as MiddlewareHandler);
  // the derived, per-caller v4 document. Anonymous (no scopes) → the public surface (default []). `scopes` is read off
  // the variables bag (the app's Variables aren't declared as AppVars here, so cast the read).
  app.get("/api/openapi.json", (c) => c.json(apiDocument({ scopes: (c.var as { scopes?: string[] }).scopes ?? [] })));
  return app;
}
