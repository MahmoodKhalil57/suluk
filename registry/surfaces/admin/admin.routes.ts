/**
 * Admin routes (Suluk registry: `admin`) — Hono over the {@link Admin} Effect service. Mount: `app.route("/api/admin",
 * adminRoutes())`. Admin-scope is enforced GLOBALLY by `enforceApiKeyScope` (the contract mount) via the contract's
 * `admin` scope on `/api/admin` — so there is NO gating in the route itself. Yours to edit; the ledger aggregate stays in
 * `@suluk/credits`.
 */
import { Hono } from "hono";
import { Effect } from "effect";
import { DbLive, type Bindings } from "../app";
import { Admin, AdminLive } from "../services/admin";

export function adminRoutes() {
  const r = new Hono<{ Bindings: Bindings }>();
  const run = <A>(env: Bindings, program: Effect.Effect<A, never, Admin>): Promise<A> =>
    program.pipe(Effect.provide(AdminLive), Effect.provide(DbLive(env)), Effect.runPromise);

  // GET /api/admin/stats → aggregate ops/usage stats (admin-scoped by the global contract gate).
  r.get("/stats", async (c) => {
    const stats = await run(c.env, Effect.flatMap(Admin, (s) => s.stats()));
    return c.json({ stats });
  });

  return r;
}
