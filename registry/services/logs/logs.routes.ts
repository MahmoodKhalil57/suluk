/**
 * Activity-log routes (Suluk registry: `logs`) — Hono over the {@link Logs} Effect service. Each route is defined with
 * `@suluk/effect`'s `effectRoute`: the handler is an Effect whose success status is EFFECT-DERIVED (not contract-hardcoded)
 * and whose error channel would bubble up as TYPED responses. Both routes are pure READS with no in-handler failure branch,
 * so they carry `errors: []` and their 200. Each route's `contract` is spread into `./logs.contract` (single source of
 * truth), so the doc/Scalar/SDK can't drift from the handler.
 *
 * Mount: `app.route("/logs", logsRoutes())` — the router mounts each handler at its sub-path (toolfactory parity). The
 * query logic stays in `@suluk/... `'s `Logs` service.
 */
import { Hono } from "hono";
import { Effect } from "effect";
import { z } from "zod";
import { effectRoute } from "@suluk/effect";
import { DbLive, type Bindings } from "../app";
import { Logs, LogsLive } from "../services/logs";

type Env = { Bindings: Bindings };
type Bind = Env["Bindings"];

/** Fully-provide a Logs program against the request's DB — the SAME layer stack the old `run` used, so the Effect's
 *  remaining requirements are discharged (`R = never`) before it reaches the effectRoute handler. */
const provide = <A, E>(env: Bind, program: Effect.Effect<A, E, Logs>): Effect.Effect<A, E, never> =>
  program.pipe(Effect.provide(LogsLive), Effect.provide(DbLive(env)));

// ── response body schema (the CURRENT success shape; one row of the append-only activity log) ──
const LogEntrySchema = z.object({
  id: z.string(),
  userId: z.string().nullable(),
  action: z.string(),
  detail: z.unknown(),
  createdAt: z.number().int(),
});
// Both routes reply `{ logs: LogEntry[] }` (newest first).
const LogsResponseSchema = z.object({ logs: z.array(LogEntrySchema) });

// Standard cost block (preserved from the current contract).
const COST_READ_20 = { components: [], infra: { "worker.request": 1, "d1.read": 20 }, settlement: { method: "rate-limited" as const } };

// ══════════════════════════════════════════════════════════════════════════════════════════
// reads — recent activity + a filtered slice. Pure reads, no failure branch → errors: [].
// ══════════════════════════════════════════════════════════════════════════════════════════

// GET /logs?userId=&limit= → { logs }. Pure read; no in-handler failure branch in the current code.
export const listLogsRoute = effectRoute({
  method: "get", path: "/api/logs", name: "listLogs",
  summary: "The caller's recent activity — an append-only action log.",
  tags: ["Activity"], scopes: ["logs:read"], cost: COST_READ_20,
  rateLimit: { windowMs: 60_000, maxRequests: 60, key: "principal" },
  request: {
    query: z.object({
      userId: z.string().optional(),
      limit: z.coerce.number().int().min(1).max(1000).optional(),
    }),
  },
  ok: { status: 200, schema: LogsResponseSchema, description: "Recent activity events." },
  errors: [],
  run: (c) => Effect.gen(function* () {
    const userId = c.req.query("userId");
    const limit = c.req.query("limit") ? Number(c.req.query("limit")) : undefined;
    const s = yield* Logs;
    return { logs: yield* s.recent({ userId, limit }) };
  }).pipe((p) => provide(c.env, p)),
});

// GET /logs/query?userId=&action=&since=&limit= → { logs }. Closed whitelist (every value a bound param in the service);
// `action` may lead with `~` for a substring match; `since` is a ms-since-epoch lower bound. Pure read, no failure branch.
export const queryLogsRoute = effectRoute({
  method: "get", path: "/api/logs/query", name: "queryLogs",
  summary: "Filter the activity log by a parameterized DSL (action / principal / time window).",
  tags: ["Activity"], scopes: ["logs:read"], cost: COST_READ_20,
  rateLimit: { windowMs: 60_000, maxRequests: 60, key: "principal" },
  request: {
    // Closed whitelist — every value compiles to a BOUND drizzle param (see the service). `action` may lead with `~`
    // for a substring match; `since` is a ms-since-epoch inclusive lower bound on `createdAt`.
    query: z.object({
      userId: z.string().optional(),
      action: z.string().optional(),
      since: z.coerce.number().int().optional(),
      limit: z.coerce.number().int().min(1).max(1000).optional(),
    }),
  },
  ok: { status: 200, schema: LogsResponseSchema, description: "The filtered activity events." },
  errors: [],
  run: (c) => Effect.gen(function* () {
    const userId = c.req.query("userId") || undefined;
    const action = c.req.query("action") || undefined;
    const since = c.req.query("since") ? Number(c.req.query("since")) : undefined;
    const limit = c.req.query("limit") ? Number(c.req.query("limit")) : undefined;
    const s = yield* Logs;
    return { logs: yield* s.query({ userId, action, since, limit }) };
  }).pipe((p) => provide(c.env, p)),
});

/**
 * Mount every route's Effect handler at its sub-path. Each handler runs its fully-provided Effect and renders the success
 * at its declared status (any typed failure would map to its status + typed body — these reads declare none).
 */
export function logsRoutes() {
  const r = new Hono<Env>();

  // ── reads ──
  r.get("/", listLogsRoute.handler);
  r.get("/query", queryLogsRoute.handler);

  return r;
}
