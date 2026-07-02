/**
 * The contract mount (Suluk registry: `contract`) — a MIDDLEWARE mount that installs, in one place, the two contract-derived
 * concerns on `/api/*`:
 *   1. the SCOPE GATE (`enforceApiKeyScope`) — a keyed caller is restricted to the scopes the contract declares per op;
 *      sessions pass through. It runs AFTER the auth `identity`/`apiKeyAuth` middleware (which set `keyId`/`scopes`).
 *   2. `GET /api/openapi.json` — the v4 document PROJECTED to the caller's scopes (anonymous → the public surface).
 * Wired into the generated entry as `mountContract(app)`. Own the wiring; @suluk/hono derives the doc + facets.
 */
import type { Hono, MiddlewareHandler } from "hono";
import { enforceInternal } from "@suluk/hono";
import type { Bindings } from "../app";
import { apiDocumentWithAuth, enforceApiKeyScope, validateRequest, matchRoute } from "../contract";
// NO `../auth` import — DECOUPLED. The Better-Auth api for the doc-merge arrives via the OPTIONAL `authApi` mount-opt, which
// platform.config.ts wires from `auth` (`{ from: "contract.authApi", to: "auth.provideAuthApi", optional: true }`). Absent →
// apiDocumentWithAuth serves the app-only doc. So `contract` builds + runs in a subset that has no `auth`.

export interface MountContractOptions {
  /** wired from auth: a factory returning the Better-Auth `api` for the `/api/openapi.json` merge. Omit → the base doc. */
  authApi?: (env: Bindings) => unknown;
}

export function mountContract<T extends Hono<{ Bindings: Bindings }>>(app: T, opts?: MountContractOptions): T {
  // INTERNAL guard FIRST — an op the contract marks `internal: true` (ops/admin surface) 404s over the wire in dev AND live
  // (so it can't be accidentally hosted); tests reach it in-process via @suluk/hono's `internalFetch`. Resolves the op the
  // same way the other gates do (matchRoute), so it can never disagree on WHICH op a request hits.
  app.use("/api/*", enforceInternal((m, p) => matchRoute(m, p)?.internal === true) as MiddlewareHandler);
  // the scope gate on every /api/* request (after auth's caller-resolution middleware set keyId/scopes).
  app.use("/api/*", enforceApiKeyScope as MiddlewareHandler);
  // the contract-derived body gate — validate a write op's JSON body against its declared request.json schema. AFTER the
  // scope gate so a missing-scope 403 precedes a bad-body 400; only tightens ops that DECLARE a schema (others pass through).
  app.use("/api/*", validateRequest as MiddlewareHandler);
  // the derived, per-caller v4 document — the app surface PLUS Better Auth's own routes (when `authApi` is wired) so
  // better-auth CLIENTS can drive the auth API from the same doc. Anonymous (no scopes) → the public surface (default []).
  app.get("/api/openapi.json", async (c) =>
    c.json(await apiDocumentWithAuth(opts?.authApi?.(c.env), { scopes: (c.var as { scopes?: string[] }).scopes ?? [] })),
  );
  return app;
}
