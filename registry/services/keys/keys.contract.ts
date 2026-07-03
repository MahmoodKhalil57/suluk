/** The `keys` module's CONTRACT fragment — its `/api/keys/*` ops. Composed via `src/contract.ops.ts` (own your ops next to
 *  your routes).
 *
 *  The lineage ops (subtree / provision / revoke) are DERIVED from their `@suluk/effect` route handlers in `./keys.routes` —
 *  the single source of truth for each op's responses (success body + status, plus any typed error responses bubble up from
 *  the handler's channels), so the doc / Scalar / SDK show the ACTUAL shapes and the route + its contract can't drift.
 *  `listKeys` (`GET /api/keys`) is served by Better Auth's apikey plugin, NOT by this module's routes, so it stays a plain
 *  hand-written contract op here (there is no `effectRoute` to derive it from). */
import { z } from "zod";
import type { RouteContract } from "@suluk/hono";
import { getKeySubtreeRoute, provisionKeyRoute, revokeKeyRoute } from "../routes/keys";

/** One row of the delegation tree as listKeys exposes it — per-key usage + its place in the lineage (scopes, caps, parent, depth). */
const KeyRowSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  start: z.string().nullable(),
  scopes: z.array(z.string()),
  enabled: z.boolean(),
  expiresAt: z.number().int().nullable(),
  lastUsed: z.number().int().nullable(),
  creditsUsed: z.number().int(),
  subtreeCreditsUsed: z.number().int(),
  creditLimit: z.number().int().nullable(),
  rateLimitSharePct: z.number().int().nullable(),
  parentKeyId: z.string().nullable(),
  depth: z.number().int(),
});

export const keysOps = [
  // listKeys — Better Auth's apikey plugin serves this (no route in this module); kept as a hand-written contract op.
  {
    method: "get", path: "/api/keys", name: "listKeys",
    summary: "The caller's API keys with their place in the delegation tree (scopes, caps, usage, lineage).",
    tags: ["API keys"], scopes: ["keys:read"],
    cost: { components: [], infra: { "worker.request": 1, "d1.read": 20 }, settlement: { method: "rate-limited" } },
    rateLimit: { windowMs: 60_000, maxRequests: 60, key: "principal" },
    errors: [401],
    responses: [{ status: 200, description: "The API-key list.", schema: z.object({ keys: z.array(KeyRowSchema) }) }],
  },
  // lineage ops — derived from the effectRoute handlers in ./keys.routes.
  getKeySubtreeRoute.contract,
  provisionKeyRoute.contract,
  revokeKeyRoute.contract,
] satisfies readonly RouteContract[];
