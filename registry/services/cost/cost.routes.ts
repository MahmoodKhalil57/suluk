/**
 * Cost routes (Suluk registry: `cost`) — Hono over the {@link Cost} Effect service. Mount: `app.route("/cost",
 * costRoutes())`. Read the ledger picture (aggregate or per-principal), and the two write paths the runtime uses:
 * `POST /event` (a live-request cost from `costMeter`'s sink) and `POST /dedup` (a fired background event, deduped so an
 * at-least-once webhook can't double-charge). Yours to edit; the projection + attribution logic stay in `@suluk/cost`.
 */
import { Hono } from "hono";
import { Effect } from "effect";
import type { CostEvent, EventCostInput } from "@suluk/cost";
import { DbLive, type Bindings } from "../app";
import { Cost, CostLive } from "../services/cost";

export function costRoutes() {
  const r = new Hono<{ Bindings: Bindings }>();
  const run = <A>(env: Bindings, program: Effect.Effect<A, never, Cost>): Promise<A> =>
    program.pipe(Effect.provide(CostLive), Effect.provide(DbLive(env)), Effect.runPromise);

  // GET /cost/summary → the aggregate ledger (total + by principal/operation/action/source).
  r.get("/summary", async (c) => {
    const summary = await run(c.env, Effect.flatMap(Cost, (s) => s.summary()));
    return c.json({ summary });
  });

  // GET /cost/summary/:userId → what one principal cost you.
  r.get("/summary/:userId", async (c) => {
    const summary = await run(c.env, Effect.flatMap(Cost, (s) => s.principalSummary(c.req.param("userId"))));
    return c.json({ summary });
  });

  // POST /cost/event — record a measured live-request CostEvent (internal: the metering middleware's sink).
  r.post("/event", async (c) => {
    const event = await c.req.json<CostEvent>();
    await run(c.env, Effect.flatMap(Cost, (s) => s.record(event)));
    return c.json({ ok: true }, 201);
  });

  // POST /cost/dedup — record a FIRED background-event cost (webhook/cron), idempotent on the model's dedupe key.
  r.post("/dedup", async (c) => {
    const input = await c.req.json<EventCostInput>();
    const res = await run(c.env, Effect.flatMap(Cost, (s) => s.recordEvent(input)));
    return c.json(res, res.recorded ? 201 : 200);
  });

  return r;
}
