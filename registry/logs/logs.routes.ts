/**
 * Activity-log routes (Suluk registry: `logs`) — Hono over the {@link Logs} Effect service. Mount: `app.route("/logs",
 * logsRoutes())`. Yours to edit.
 */
import { Hono } from "hono";
import { Effect } from "effect";
import { DbLive, type Bindings } from "../app";
import { Logs, LogsLive } from "../services/logs";

export function logsRoutes() {
  const r = new Hono<{ Bindings: Bindings }>();
  const run = <A>(env: Bindings, program: Effect.Effect<A, never, Logs>): Promise<A> =>
    program.pipe(Effect.provide(LogsLive), Effect.provide(DbLive(env)), Effect.runPromise);

  // GET /logs?userId=&limit= → recent activity.
  r.get("/", async (c) => {
    const userId = c.req.query("userId");
    const limit = c.req.query("limit") ? Number(c.req.query("limit")) : undefined;
    const logs = await run(c.env, Effect.flatMap(Logs, (s) => s.recent({ userId, limit })));
    return c.json({ logs });
  });

  return r;
}
