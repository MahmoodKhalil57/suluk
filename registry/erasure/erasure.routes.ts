/**
 * Erasure routes (Suluk registry: `erasure`) — Hono over the {@link Erasure} Effect service. Mount: `app.route("/erasure",
 * erasureRoutes())`. GATE THIS in production (admin/self-only) — it erases a user's data across every subsystem. The
 * proper integration is Better Auth's `deleteUser.beforeDelete` (wire `erasureHook` into `buildAuth`); this route is the
 * manual/admin trigger. Fail-closed: a failed step aborts the cascade and returns 500 with no receipt written.
 */
import { Hono } from "hono";
import { Effect } from "effect";
import { DbLive, type Bindings } from "../app";
import { Erasure, ErasureLive, type ExtraSteps } from "../services/erasure";

export interface MountErasureOptions {
  /** wired from platform.config.ts: the COMPOSED per-module erase-steps (`erasure.cascade → <module>.eraseStep`, fan-in).
   *  Omit → the empty cascade (a subset with no installed data modules, or a manual/hand-written cascade). */
  extraSteps?: ExtraSteps;
}

export function erasureRoutes(opts?: MountErasureOptions) {
  const r = new Hono<{ Bindings: Bindings }>();
  const run = <A>(env: Bindings, program: Effect.Effect<A, never, Erasure>): Promise<A> =>
    program.pipe(Effect.provide(ErasureLive(opts?.extraSteps)), Effect.provide(DbLive(env)), Effect.runPromise);

  // POST /erasure/:userId — run the GDPR erasure cascade for a user (ADMIN-GATE in production).
  r.post("/:userId", async (c) => {
    const res = await run(c.env, Effect.flatMap(Erasure, (s) => s.erase(c.req.param("userId"))));
    return c.json(res);
  });

  return r;
}
