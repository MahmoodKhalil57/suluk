/**
 * Erasure routes (Suluk registry: `erasure`) — Hono over the {@link Erasure} Effect service, defined with `@suluk/effect`'s
 * `effectRoute`: the handler is an Effect whose success body is the GDPR erasure receipt. Mount:
 * `app.route("/api/erasure", erasureRoutes())`. GATE THIS in production (admin/self-only) — it erases a user's data across
 * every subsystem. The proper integration is Better Auth's `deleteUser.beforeDelete` (wire `erasureHook` into `buildAuth`);
 * this route is the manual/admin trigger. Fail-closed: a failed cascade step ABORTS the cascade — it surfaces as a 500
 * (no typed error channel; the throw is a DEFECT, which effectRoute renders as a Problem-Details 500) with no receipt written.
 */
import { Hono } from "hono";
import { Effect } from "effect";
import { z } from "zod";
import { effectRoute } from "@suluk/effect";
import { DbLive, type Bindings } from "../app";
import { Erasure, ErasureLive, type ExtraSteps } from "../services/erasure";

export interface MountErasureOptions {
  /** wired from platform.config.ts: the COMPOSED per-module erase-steps (`erasure.cascade → <module>.eraseStep`, fan-in).
   *  Omit → the empty cascade (a subset with no installed data modules, or a manual/hand-written cascade). */
  extraSteps?: ExtraSteps;
}

/** The GDPR erasure receipt the cascade returns — the ordered names of the steps that ran. */
const ErasureReceiptSchema = z.object({
  steps: z.array(z.string()),
});

/**
 * The `eraseUser` route — the single admin GDPR-erasure op. Its `.contract` is the source of truth for `./erasure.contract`.
 * NO typed error channel: the service's `erase` is `Effect<{ steps }, never, Erasure>`; a failed cascade step throws inside
 * it (a DEFECT), which the effectRoute handler surfaces as a Problem-Details 500 — fail-closed, no receipt. So `errors: []`.
 *
 * The layer stack (`ErasureLive(extraSteps)` + `DbLive(env)`) is the SAME the old `run` used — it fully discharges the
 * Effect's requirements (`R = never`). `extraSteps` are read off `c.var` (the mount stashes the COMPOSED per-module steps),
 * so the contract stays a stable module-scope constant while the handler still gets the wired cascade.
 */
export const eraseUserRoute = effectRoute({
  method: "post", path: "/api/erasure/:userId", name: "eraseUser",
  summary: "Run the GDPR erasure cascade for a user across every subsystem. ADMIN-only; fail-closed (a failed step aborts with no receipt).",
  tags: ["Admin"], scopes: ["admin"],
  cost: { components: [], infra: { "worker.request": 1, "d1.write": 1, "d1.read": 1 }, settlement: { method: "rate-limited" } },
  rateLimit: { windowMs: 60_000, maxRequests: 20, key: "principal" }, // destructive admin op → tight per-principal cap
  request: { params: z.object({ userId: z.string() }) },
  ok: { status: 200, schema: ErasureReceiptSchema, description: "The erasure cascade completed." },
  errors: [],
  run: (c) => Effect.gen(function* () {
    const s = yield* Erasure;
    return yield* s.erase(c.req.param("userId")!); // :userId is a required path param — always present
  }).pipe((p) => p.pipe(
    Effect.provide(ErasureLive((c.var as { extraSteps?: ExtraSteps }).extraSteps)),
    Effect.provide(DbLive(c.env as Bindings)),
  )),
});

export function erasureRoutes(opts?: MountErasureOptions) {
  const r = new Hono<{ Bindings: Bindings }>();

  // Stash the COMPOSED per-module erase-steps on the context so the route's fully-provided handler wires the cascade.
  r.use("*", async (c, next) => { (c as { set: (k: string, v: unknown) => void }).set("extraSteps", opts?.extraSteps); await next(); });

  // POST /erasure/:userId — the GDPR erasure cascade (ADMIN-GATE in production).
  r.post("/:userId", eraseUserRoute.handler);

  return r;
}
