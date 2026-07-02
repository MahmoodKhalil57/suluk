/**
 * API-key management routes (Suluk registry: `keys`) — Hono over the {@link Keys} Effect service. Provides a default
 * `DisableKeys` that soft-disables rows in Better Auth's `apikey` table (`enabled = 0`); override it to match your setup.
 * Mount: `app.route("/keys", keysRoutes())`. Key CREATION is Better Auth's apikey plugin (in `auth`).
 */
import { Hono } from "hono";
import { Effect, Layer } from "effect";
import { drizzle } from "drizzle-orm/d1";
import { sql } from "drizzle-orm";
import type { EffectiveCaps } from "@suluk/keys";
import { DbLive, type Bindings } from "../app";
import { Keys, KeysLive, DisableKeys, CreateKey, type RequestedCaps } from "../services/keys";

export function keysRoutes() {
  const r = new Hono<{ Bindings: Bindings }>();

  // default apikey-disable — Better Auth's apikey table has an `enabled` flag; soft-disable the revoked ids.
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

  const run = <A>(env: Bindings, program: Effect.Effect<A, never, Keys>): Promise<A> =>
    program.pipe(Effect.provide(KeysLive), Effect.provide(DisableKeysLive(env)), Effect.provide(DbLive(env)), Effect.runPromise);

  // the provision path additionally provides CreateKey (the delegated-mint hook).
  const runProvision = <A>(env: Bindings, program: Effect.Effect<A, never, Keys | CreateKey>): Promise<A> =>
    program.pipe(Effect.provide(KeysLive), Effect.provide(DisableKeysLive(env)), Effect.provide(CreateKeyLive), Effect.provide(DbLive(env)), Effect.runPromise);

  // GET /keys/:keyId/subtree → the descendant key ids.
  r.get("/:keyId/subtree", async (c) => c.json({ subtree: await run(c.env, Effect.flatMap(Keys, (s) => s.subtree(c.req.param("keyId")))) }));

  // POST /keys/:keyId/revoke { userId, callerKeyId? } → cascade-revoke the key + its subtree.
  r.post("/:keyId/revoke", async (c) => {
    const { userId, callerKeyId } = await c.req.json<{ userId: string; callerKeyId?: string }>();
    return c.json(await run(c.env, Effect.flatMap(Keys, (s) => s.revokeTree(userId, c.req.param("keyId"), callerKeyId))));
  });

  // POST /keys/provision { userId, parentKeyId?, parentCaps?, requested } → mint a delegated child key, caps CLAMPED to the
  // parent's (abuse-proof), lineage recorded. Requires CreateKey wired (see CreateKeyLive above). Returns the plaintext key ONCE.
  r.post("/provision", async (c) => {
    const body = await c.req.json<{ userId: string; parentKeyId?: string; parentCaps?: EffectiveCaps; requested: RequestedCaps }>();
    const res = await runProvision(c.env, Effect.flatMap(Keys, (s) => s.provision(body)));
    return c.json(res, 201);
  });

  return r;
}
