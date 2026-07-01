/**
 * Erasure routes (Suluk registry: `erasure`) — Hono over the {@link Erasure} Effect service. Mount: `app.route("/erasure",
 * erasureRoutes())`. GATE THIS in production (admin/self-only) — it erases a user's data across every subsystem. The
 * proper integration is Better Auth's `deleteUser.beforeDelete` (wire `erasureHook` into `buildAuth`); this route is the
 * manual/admin trigger. Fail-closed: a failed step aborts the cascade and returns 500 with no receipt written.
 */
import { Hono } from "hono";
import { Effect } from "effect";
import { DbLive, type Bindings } from "../app";
import { Erasure, ErasureLive } from "../services/erasure";

export function erasureRoutes() {
  const r = new Hono<{ Bindings: Bindings }>();
  const run = <A>(env: Bindings, program: Effect.Effect<A, never, Erasure>): Promise<A> =>
    program.pipe(Effect.provide(ErasureLive), Effect.provide(DbLive(env)), Effect.runPromise);

  // POST /erasure/:userId — run the GDPR erasure cascade for a user (ADMIN-GATE in production).
  r.post("/:userId", async (c) => {
    const res = await run(c.env, Effect.flatMap(Erasure, (s) => s.erase(c.req.param("userId"))));
    return c.json(res);
  });

  return r;
}
