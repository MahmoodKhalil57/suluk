/**
 * The Cost service (Suluk registry: `cost`) — an Effect-TS service that persists runtime cost into D1 and reads the raw
 * ledger picture back. The projection + background-event logic stay in `@suluk/cost` (integer µ$ throughout, `at` passed
 * in for reproducibility, dedup-key resolution off the payload); THIS layer is the owned D1 seam:
 *   - `record`      — a live-request `CostEvent` (from `costMeter`'s sink) → a `cost_event` row.
 *   - `recordEvent` — a FIRED background event (webhook/cron/queue): build via `eventCostEvent` (attribution + reconciled
 *                     amount + dedupeKey), then dedup against `cost_dedup` (at-least-once safe) before recording.
 *   - `summary` / `principalSummary` — read the events back and `summarize` (total + by principal/operation/action/source).
 * Depends on `Db` (`app`). Compose: `Layer.provide(CostLive, DbLive(env))`.
 */
import { Context, Effect, Layer } from "effect";
import { eq } from "drizzle-orm";
import { summarize, principalCost, eventCostEvent, type CostEvent, type CostSummary, type EventCostInput } from "@suluk/cost";
import { costEvent, costDedup } from "../db/cost";
import { Db } from "../app";

export class Cost extends Context.Tag("Cost")<
  Cost,
  {
    /** persist a measured live-request cost (the `costMeter` sink path). */
    readonly record: (event: CostEvent) => Effect.Effect<void>;
    /** persist a FIRED background-event cost, deduped by the model's idempotency key. `recorded:false` ⇒ a duplicate. */
    readonly recordEvent: (input: EventCostInput) => Effect.Effect<{ recorded: boolean }>;
    /** the aggregate ledger picture across every recorded event. */
    readonly summary: () => Effect.Effect<CostSummary>;
    /** what ONE principal cost you (total + trace by operation/action/source). */
    readonly principalSummary: (userId: string) => Effect.Effect<CostSummary>;
  }
>() {}

/** Row → the raw `CostEvent` the ledger projections consume. */
type CostRow = typeof costEvent.$inferSelect;
function toEvent(r: CostRow): CostEvent {
  return {
    at: r.createdAt.getTime(),
    principal: r.userId ?? undefined,
    operation: r.operation,
    action: r.action ?? undefined,
    trigger: (r.trigger as CostEvent["trigger"]) ?? undefined,
    reconciled: !!r.reconciled,
    breakdown: r.breakdown ? (JSON.parse(r.breakdown) as CostEvent["breakdown"]) : [],
    totalMicroUsd: r.totalMicroUsd,
  };
}

export const CostLive = Layer.effect(
  Cost,
  Effect.gen(function* () {
    const db = yield* Db;

    const insertEvent = (e: CostEvent) =>
      db.insert(costEvent).values({
        id: crypto.randomUUID(),
        userId: e.principal ?? null,
        operation: e.operation,
        action: e.action ?? null,
        trigger: e.trigger ?? null,
        totalMicroUsd: e.totalMicroUsd,
        reconciled: e.reconciled ? 1 : 0,
        breakdown: JSON.stringify(e.breakdown),
        createdAt: new Date(e.at),
      });

    return {
      record: (event) => Effect.promise(async () => void (await insertEvent(event))),

      recordEvent: (input) =>
        Effect.promise(async () => {
          const event = eventCostEvent(input);
          if (event.dedupeKey) {
            // single-statement claim: if the key already exists the insert is a no-op and returns nothing → duplicate.
            const claimed = await db
              .insert(costDedup)
              .values({ dedupeKey: event.dedupeKey, operation: event.operation, createdAt: new Date(event.at) })
              .onConflictDoNothing()
              .returning({ dedupeKey: costDedup.dedupeKey });
            if (claimed.length === 0) return { recorded: false };
          }
          await insertEvent(event);
          return { recorded: true };
        }),

      summary: () =>
        Effect.promise(async () => {
          const rows = await db.select().from(costEvent);
          return summarize(rows.map(toEvent));
        }),

      principalSummary: (userId) =>
        Effect.promise(async () => {
          const rows = await db.select().from(costEvent).where(eq(costEvent.userId, userId));
          return principalCost(rows.map(toEvent), userId);
        }),
    };
  }),
);
