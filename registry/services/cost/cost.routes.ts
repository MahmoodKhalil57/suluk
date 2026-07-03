/**
 * Cost routes (Suluk registry: `cost`) — Hono over the {@link Cost} Effect service, each route defined with `@suluk/effect`'s
 * `effectRoute`: the handler is an Effect whose SUCCESS body + status and (typed) ERROR channel bubble up into the contract as
 * DETAILED responses the doc/Scalar/SDK render — a malformed write body surfaces as a typed 400 `ValidationError`, not a generic
 * ProblemDetails. Mount: `app.route("/cost", costRoutes())` — the paths below are sub-paths, so the full surface is `/cost/*`.
 *
 * Read the ledger picture (aggregate or per-principal — pure reads, no failure branch), and the two write paths the runtime
 * uses: `POST /event` (a live-request cost from `costMeter`'s sink) and `POST /dedup` (a fired background event, deduped so an
 * at-least-once webhook can't double-charge). The projection + attribution logic stay in `@suluk/cost`.
 */
import { Effect } from "effect";
import { effectRoute, routeGroup, ValidationError, Ok } from "@suluk/effect";
import type { CostEvent, EventCostInput } from "@suluk/cost";
import { DbLive, type Bindings } from "../app";
import { Cost, CostLive } from "../services/cost";
import {
  CostSummaryBody, RecordEventBody, RecordDedupBody, UserIdParams,
} from "./cost.schemas";

// The module's ENVELOPE — its `.ops` bubbles up into the contract (replacing `cost.contract.ts`) and its `.router()` is the
// mount. The single source of truth for the `/api/cost/*` surface is the route definitions below.
const cost = routeGroup("/api/cost");

/** Fully-provide a Cost program against the request's DB — the SAME layer stack the old `run` used, so the Effect's remaining
 *  requirements are discharged (`R = never`) before it reaches the effectRoute handler. */
const provide = <A, E>(env: Bindings, program: Effect.Effect<A, E, Cost>): Effect.Effect<A, E, never> =>
  program.pipe(Effect.provide(CostLive), Effect.provide(DbLive(env)));

// ══════════════════════════════════════════════════════════════════════════════════════════
// reads — the ledger picture (no failure branch in the current code → `errors: []`).
// ══════════════════════════════════════════════════════════════════════════════════════════

// GET /cost/summary → the aggregate ledger (total + by principal/operation/action/source).
export const getCostSummaryRoute = cost.route(effectRoute({
  method: "get", path: "/api/cost/summary", name: "getCostSummary",
  summary: "The aggregate cost ledger (total + breakdown by principal / operation / action / source).",
  tags: ["Cost"], scopes: ["cost:read"],
  cost: { components: [], infra: { "worker.request": 1, "d1.read": 1 }, settlement: { method: "rate-limited" } },
  rateLimit: { windowMs: 60_000, maxRequests: 60, key: "principal" },
  ok: { status: 200, schema: CostSummaryBody, description: "The aggregate cost summary." },
  errors: [],
  run: (c) => Effect.gen(function* () {
    const s = yield* Cost;
    return { summary: yield* s.summary() };
  }).pipe((p) => provide(c.env, p)),
}));

// GET /cost/summary/:userId → what one principal cost you.
export const getUserCostSummaryRoute = cost.route(effectRoute({
  method: "get", path: "/api/cost/summary/:userId", name: "getUserCostSummary",
  summary: "What one principal cost you — the per-user cost summary.",
  tags: ["Cost"], scopes: ["cost:read"],
  cost: { components: [], infra: { "worker.request": 1, "d1.read": 1 }, settlement: { method: "rate-limited" } },
  rateLimit: { windowMs: 60_000, maxRequests: 60, key: "principal" },
  request: { params: UserIdParams },
  ok: { status: 200, schema: CostSummaryBody, description: "The per-principal cost summary." },
  errors: [],
  run: (c) => Effect.gen(function* () {
    const s = yield* Cost;
    return { summary: yield* s.principalSummary(c.req.param("userId")!) }; // :userId is a required path param — always present
  }).pipe((p) => provide(c.env, p)),
}));

// ══════════════════════════════════════════════════════════════════════════════════════════
// writes — record a measured / fired cost. A malformed body → the contract's declared typed 400.
// ══════════════════════════════════════════════════════════════════════════════════════════

// POST /cost/event — record a measured live-request CostEvent (internal: the metering middleware's sink). Returns 201.
export const recordCostEventRoute = cost.route(effectRoute({
  method: "post", path: "/api/cost/event", name: "recordCostEvent",
  summary: "Record a per-request cost event (at-least-once; deduped on the idempotency key).",
  tags: ["Cost"], scopes: ["cost:read"],
  cost: { components: [], infra: { "worker.request": 1, "d1.write": 1, "d1.read": 1 }, settlement: { method: "rate-limited" } },
  rateLimit: { windowMs: 60_000, maxRequests: 120, key: "principal" },
  ok: { status: 201, schema: RecordEventBody, description: "The cost event was recorded (or replayed)." },
  errors: [ValidationError], // the contract's declared 400 — a malformed request body.
  run: (c) => Effect.gen(function* () {
    const event = yield* Effect.tryPromise({
      try: () => c.req.json<CostEvent>(),
      catch: () => new ValidationError({ issues: ["request body must be a valid CostEvent JSON object"] }),
    });
    const s = yield* Cost;
    yield* s.record(event);
    return { ok: true as const };
  }).pipe((p) => provide(c.env, p)),
}));

// POST /cost/dedup — record a FIRED background-event cost (webhook/cron), idempotent on the model's dedupe key.
// A fresh insert → 201; a duplicate replay → 200 (via `respond`, since the status is data-dependent).
export const recordCostDedupRoute = cost.route(effectRoute({
  method: "post", path: "/api/cost/dedup", name: "recordCostDedup",
  summary: "Record a cost dedup marker (the at-least-once ledger for webhook-driven costs).",
  tags: ["Cost"], scopes: ["cost:read"],
  cost: { components: [], infra: { "worker.request": 1, "d1.write": 1, "d1.read": 1 }, settlement: { method: "rate-limited" } },
  rateLimit: { windowMs: 60_000, maxRequests: 120, key: "principal" },
  ok: { status: 201, schema: RecordDedupBody, description: "The dedup marker was recorded." },
  errors: [ValidationError], // the contract's declared 400 — a malformed request body.
  run: (c) => Effect.gen(function* () {
    const input = yield* Effect.tryPromise({
      try: () => c.req.json<EventCostInput>(),
      catch: () => new ValidationError({ issues: ["request body must be a valid EventCostInput JSON object"] }),
    });
    const s = yield* Cost;
    const res = yield* s.recordEvent(input);
    return res.recorded ? { recorded: true } : Ok({ recorded: false as const });
  }).pipe((p) => provide(c.env, p)),
}));

/** The `cost` module's CONTRACT fragment — bubbled up from the routes above (replaces `cost.contract.ts`). */
export const costOps = cost.ops;

/**
 * Mount every route's Effect handler at its sub-path — DERIVED from the envelope (`.router()`), so the mount can't drift
 * from the definitions and there's no per-route list. Dedup's 201-vs-200 is data-dependent via `respond`.
 */
export function costRoutes() {
  return cost.router();
}
