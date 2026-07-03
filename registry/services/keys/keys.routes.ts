/**
 * API-key management routes (Suluk registry: `keys`) — Hono over the {@link Keys} Effect service, each route defined with
 * `@suluk/effect`'s `effectRoute`: the handler is an Effect whose success body + status AND its (typed) error channel bubble
 * up into `./keys.contract` as DETAILED responses, so the doc / Scalar / SDK show the ACTUAL shapes (not a generic
 * ProblemDetails). Provides a default `DisableKeys` that soft-disables rows in Better Auth's `apikey` table
 * (`enabled = 0`); override it to match your setup. Mount: `app.route("/api/keys", keysRoutes())`. Key CREATION + LISTING is
 * Better Auth's apikey plugin (in `auth`) — this module manages the lineage + headroom + revoke (subtree / revoke / provision).
 */
import { Effect, Layer } from "effect";
import { z } from "zod";
import { drizzle } from "drizzle-orm/d1";
import { sql } from "drizzle-orm";
import { effectRoute, routeGroup } from "@suluk/effect";
import type { EffectiveCaps } from "@suluk/keys";
import { DbLive, type Bindings } from "../app";
import { Keys, KeysLive, DisableKeys, CreateKey, type RequestedCaps } from "../services/keys";
import { EffectiveCapsSchema } from "./keys.schemas";

// The module's ENVELOPE — its `.ops` bubbles up into the contract (replacing `keys.contract.ts`) and its `.router()` is the
// mount. The `/api/keys/*` surface (the lineage routes below + the Better-Auth-served `listKeys` doc op) lives here.
const keys = routeGroup("/api/keys");

// default apikey-disable — Better Auth's apikey table has an `enabled` flag; soft-disable the revoked ids. Provided per env.
const DisableKeysLive = (env: Bindings) =>
  Layer.succeed(DisableKeys, async (userId: string, keyIds: string[]) => {
    if (!keyIds.length) return 0;
    const db = drizzle(env.DB);
    let n = 0;
    for (const id of keyIds) {
      await db.run(sql`UPDATE apikey SET enabled = 0 WHERE id = ${id} AND userId = ${userId}`);
      n++;
    }
    return n;
  });

// default key-mint — THROWS until you wire it: minting a real (hashed/prefixed) key is Better Auth's job. Override with
// a Layer.succeed(CreateKey, async ({userId, caps, parentKeyId}) => { const k = await auth.api.createApiKey({...}); ... }).
const CreateKeyLive = Layer.succeed(CreateKey, async () => {
  throw new Error("keys: provide CreateKey from your auth layer (Better Auth `auth.api.createApiKey`) to mint delegated keys");
});

/** Fully-provide a Keys program against the request's DB + the apikey-disable hook — the SAME `run` layer stack the old code
 *  used, so the Effect's remaining requirements are discharged (`R = never`) before it reaches the effectRoute handler. */
const provide = <A>(env: Bindings, program: Effect.Effect<A, never, Keys>): Effect.Effect<A, never, never> =>
  program.pipe(Effect.provide(KeysLive), Effect.provide(DisableKeysLive(env)), Effect.provide(DbLive(env)));

/** The provision path additionally provides CreateKey (the delegated-mint hook) — the SAME `runProvision` layer stack. */
const provideProvision = <A>(env: Bindings, program: Effect.Effect<A, never, Keys | CreateKey>): Effect.Effect<A, never, never> =>
  program.pipe(Effect.provide(KeysLive), Effect.provide(DisableKeysLive(env)), Effect.provide(CreateKeyLive), Effect.provide(DbLive(env)));

// ── response body schemas (the CURRENT success shapes) ──
const SubtreeBody = z.object({ subtree: z.array(z.string()) });
const RevokeBody = z.object({ revoked: z.number().int() });
const ProvisionBody = z.object({ keyId: z.string(), key: z.string(), caps: EffectiveCapsSchema });

// ── request body schemas (the CURRENT request shapes) ──
const RevokeReq = z.object({ userId: z.string().min(1), callerKeyId: z.string().min(1).optional() });
const ProvisionReq = z.object({
  userId: z.string().min(1),
  parentKeyId: z.string().min(1).optional(),
  parentCaps: z.object({ scopes: z.array(z.string()), creditLimit: z.number().int().nonnegative().nullable().optional(), rateLimitSharePct: z.number().nonnegative().nullable().optional(), expiresAt: z.number().int().nullable().optional() }).optional(),
  requested: z.object({ scopes: z.array(z.string()), creditLimit: z.number().int().nonnegative().nullable().optional(), rateLimitSharePct: z.number().nonnegative().nullable().optional(), expiresAt: z.number().int().nullable().optional() }),
});

// listKeys — a DOC-ONLY op: Better Auth's apikey plugin serves `GET /api/keys` (there is no route handler in this module to
// derive it from). Moved from the old `keys.contract.ts` so the whole `/api/keys` surface lives next to its routes. One row
// of the delegation tree as listKeys exposes it — per-key usage + its place in the lineage (scopes, caps, parent, depth).
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
keys.doc({
  method: "get", path: "/api/keys", name: "listKeys",
  summary: "The caller's API keys with their place in the delegation tree (scopes, caps, usage, lineage).",
  tags: ["API keys"], scopes: ["keys:read"],
  cost: { components: [], infra: { "worker.request": 1, "d1.read": 20 }, settlement: { method: "rate-limited" } },
  rateLimit: { windowMs: 60_000, maxRequests: 60, key: "principal" },
  errors: [401],
  responses: [{ status: 200, description: "The API-key list.", schema: z.object({ keys: z.array(KeyRowSchema) }) }],
});

// GET /keys/:keyId/subtree → the descendant key ids. A pure read (the service never fails) → no typed error paths.
export const getKeySubtreeRoute = keys.route(effectRoute({
  method: "get", path: "/api/keys/:keyId/subtree", name: "getKeySubtree",
  summary: "The delegation subtree rooted at a key (its descendants + their caps/usage).",
  tags: ["API keys"], scopes: ["keys:read"],
  cost: { components: [], infra: { "worker.request": 1, "d1.read": 1 }, settlement: { method: "rate-limited" } },
  rateLimit: { windowMs: 60_000, maxRequests: 60, key: "principal" },
  ok: { status: 200, schema: SubtreeBody, description: "The key's delegation subtree." },
  errors: [],
  run: (c) => Effect.gen(function* () {
    const s = yield* Keys;
    return { subtree: yield* s.subtree(c.req.param("keyId")!) };
  }).pipe((p) => provide(c.env, p)),
}));

// POST /keys/provision — mint a delegated child key, caps CLAMPED to the parent's, lineage recorded; plaintext key returned
// ONCE. A CREATE → 201 (kept from the current code). The service never fails → no typed error paths.
export const provisionKeyRoute = keys.route(effectRoute({
  method: "post", path: "/api/keys/provision", name: "provisionKey",
  summary: "Mint a CHILD API key, its caps CLAMPED to the caller's own grant (a child can never out-scope an ancestor). Returns the plaintext key ONCE.",
  tags: ["API keys"], scopes: ["keys:write"],
  cost: { components: [], infra: { "worker.request": 1, "d1.write": 1, "d1.read": 1 }, settlement: { method: "rate-limited" } },
  rateLimit: { windowMs: 60_000, maxRequests: 30, key: "principal" },
  request: { json: ProvisionReq },
  ok: { status: 201, schema: ProvisionBody, description: "The provisioned key (plaintext returned once)." },
  errors: [],
  run: (c) => Effect.gen(function* () {
    const body = yield* Effect.promise(() => c.req.json<{ userId: string; parentKeyId?: string; parentCaps?: EffectiveCaps; requested: RequestedCaps }>());
    const s = yield* Keys;
    return yield* s.provision(body);
  }).pipe((p) => provideProvision(c.env, p)),
}));

// POST /keys/:keyId/revoke { userId, callerKeyId? } → cascade-revoke the key + its subtree. The service never fails → no
// typed error paths.
export const revokeKeyRoute = keys.route(effectRoute({
  method: "post", path: "/api/keys/:keyId/revoke", name: "revokeKey",
  summary: "Cascade-revoke an API key and every descendant it provisioned, transitively.",
  tags: ["API keys"], scopes: ["keys:write"],
  cost: { components: [], infra: { "worker.request": 1, "d1.write": 1, "d1.read": 1 }, settlement: { method: "rate-limited" } },
  rateLimit: { windowMs: 60_000, maxRequests: 30, key: "principal" },
  request: { json: RevokeReq },
  ok: { status: 200, schema: RevokeBody, description: "The key + its subtree were revoked." },
  errors: [],
  run: (c) => Effect.gen(function* () {
    const { userId, callerKeyId } = yield* Effect.promise(() => c.req.json<{ userId: string; callerKeyId?: string }>());
    const s = yield* Keys;
    return yield* s.revokeTree(userId, c.req.param("keyId")!, callerKeyId);
  }).pipe((p) => provide(c.env, p)),
}));

/** The `keys` module's CONTRACT fragment — bubbled up from the doc op + routes above (replaces `keys.contract.ts`). */
export const keysOps = keys.ops;

/**
 * Mount every route's Effect handler at its sub-path — DERIVED from the envelope (`.router()`), so the mount can't drift from
 * the definitions. (Key LISTING — `GET /api/keys` `listKeys` — is Better Auth's apikey plugin, a doc-only op above.)
 */
export function keysRoutes() {
  return keys.router();
}
