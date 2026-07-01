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

  // GET /logs/query?userId=&action=&since=&limit= → the filtered activity slice (closed whitelist; every value a bound
  // param in the service). `action` may lead with `~` for a substring match; `since` is a ms-since-epoch lower bound.
  r.get("/query", async (c) => {
    const userId = c.req.query("userId") || undefined;
    const action = c.req.query("action") || undefined;
    const since = c.req.query("since") ? Number(c.req.query("since")) : undefined;
    const limit = c.req.query("limit") ? Number(c.req.query("limit")) : undefined;
    const logs = await run(c.env, Effect.flatMap(Logs, (s) => s.query({ userId, action, since, limit })));
    return c.json({ logs });
  });

  return r;
}
