/** The `keys` module's CONTRACT fragment — its `/api/keys/*` ops. Composed via `src/contract.ops.ts` (own your ops next to your routes). */
import { z } from "zod";
import type { RouteContract } from "@suluk/hono";

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

/** The caller's EFFECTIVE grant on a key — scopes ∩ + the MIN (soonest) cap/expiry up the chain. Echoed by provisionKey. */
const EffectiveCapsSchema = z.object({
  scopes: z.array(z.string()),
  creditLimit: z.number().int().nullable(),
  rateLimitSharePct: z.number().nonnegative().nullable(),
  expiresAt: z.number().int().nullable(),
});

export const keysOps = [
  {
    method: "get", path: "/api/keys", name: "listKeys",
    summary: "The caller's API keys with their place in the delegation tree (scopes, caps, usage, lineage).",
    tags: ["API keys"], scopes: ["keys:read"],
    rateLimit: { windowMs: 60_000, maxRequests: 60, key: "principal" },
    errors: [401],
    responses: [{ status: 200, description: "The API-key list.", schema: z.object({ keys: z.array(KeyRowSchema) }) }],
  },
  {
    method: "get", path: "/api/keys/:keyId/subtree", name: "getKeySubtree",
    summary: "The delegation subtree rooted at a key (its descendants + their caps/usage).",
    tags: ["API keys"], scopes: ["keys:read"],
    rateLimit: { windowMs: 60_000, maxRequests: 60, key: "principal" },
    errors: [401, 404],
    // the route returns the descendant key ids: `c.json({ subtree: await s.subtree(keyId) })`.
    responses: [{ status: 200, description: "The key's delegation subtree.", schema: z.object({ subtree: z.array(z.string()) }) }],
  },
  {
    method: "post", path: "/api/keys/provision", name: "provisionKey",
    summary: "Mint a CHILD API key, its caps CLAMPED to the caller's own grant (a child can never out-scope an ancestor). Returns the plaintext key ONCE.",
    tags: ["API keys"], scopes: ["keys:write"],
    rateLimit: { windowMs: 60_000, maxRequests: 30, key: "principal" },
    errors: [400, 401, 403],
    request: {
      json: z.object({
        userId: z.string().min(1),
        parentKeyId: z.string().min(1).optional(),
        parentCaps: z.object({ scopes: z.array(z.string()), creditLimit: z.number().int().nonnegative().nullable().optional(), rateLimitSharePct: z.number().nonnegative().nullable().optional(), expiresAt: z.number().int().nullable().optional() }).optional(),
        requested: z.object({ scopes: z.array(z.string()), creditLimit: z.number().int().nonnegative().nullable().optional(), rateLimitSharePct: z.number().nonnegative().nullable().optional(), expiresAt: z.number().int().nullable().optional() }),
      }),
    },
    // the route returns `s.provision(body)` at 201: { keyId, key (plaintext, once), caps }.
    responses: [{ status: 201, description: "The provisioned key (plaintext returned once).", schema: z.object({ keyId: z.string(), key: z.string(), caps: EffectiveCapsSchema }) }],
  },
  {
    method: "post", path: "/api/keys/:keyId/revoke", name: "revokeKey",
    summary: "Cascade-revoke an API key and every descendant it provisioned, transitively.",
    tags: ["API keys"], scopes: ["keys:write"],
    rateLimit: { windowMs: 60_000, maxRequests: 30, key: "principal" },
    errors: [401, 403, 404],
    // the route returns `s.revokeTree(userId, keyId, callerKeyId)`: { revoked: <count disabled> }.
    responses: [{ status: 200, description: "The key + its subtree were revoked.", schema: z.object({ revoked: z.number().int() }) }],
  },
] satisfies readonly RouteContract[];
