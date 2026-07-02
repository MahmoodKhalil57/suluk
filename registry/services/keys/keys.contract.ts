/** The `keys` module's CONTRACT fragment — its `/api/keys/*` ops. Composed via `src/contract.ops.ts` (own your ops next to your routes). */
import { z } from "zod";
import type { RouteContract } from "@suluk/hono";

export const keysOps = [
  { method: "get", path: "/api/keys", name: "listKeys", summary: "The caller's API keys with their place in the delegation tree (scopes, caps, usage, lineage).", tags: ["API keys"], scopes: ["keys:read"], responses: [{ status: 200, description: "The API-key list." }] },
  { method: "get", path: "/api/keys/:keyId/subtree", name: "getKeySubtree", summary: "The delegation subtree rooted at a key (its descendants + their caps/usage).", tags: ["API keys"], scopes: ["keys:read"], responses: [{ status: 200, description: "The key's delegation subtree." }] },
  {
    method: "post", path: "/api/keys/provision", name: "provisionKey",
    summary: "Mint a CHILD API key, its caps CLAMPED to the caller's own grant (a child can never out-scope an ancestor). Returns the plaintext key ONCE.",
    tags: ["API keys"], scopes: ["keys:write"],
    request: {
      json: z.object({
        userId: z.string().min(1),
        parentKeyId: z.string().min(1).optional(),
        parentCaps: z.object({ scopes: z.array(z.string()), creditLimit: z.number().int().nonnegative().nullable().optional(), rateLimitSharePct: z.number().nonnegative().nullable().optional(), expiresAt: z.number().int().nullable().optional() }).optional(),
        requested: z.object({ scopes: z.array(z.string()), creditLimit: z.number().int().nonnegative().nullable().optional(), rateLimitSharePct: z.number().nonnegative().nullable().optional(), expiresAt: z.number().int().nullable().optional() }),
      }),
    },
    responses: [{ status: 201, description: "The provisioned key (plaintext returned once)." }],
  },
  { method: "post", path: "/api/keys/:keyId/revoke", name: "revokeKey", summary: "Cascade-revoke an API key and every descendant it provisioned, transitively.", tags: ["API keys"], scopes: ["keys:write"], responses: [{ status: 200, description: "The key + its subtree were revoked." }] },
] satisfies readonly RouteContract[];
