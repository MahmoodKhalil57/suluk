/** Shared zod schemas for the `cost` module — the wire shapes the routes' `@suluk/effect` `ok.schema` + request declarations
 *  reuse. The contract fragment is DERIVED from `<name>Route.contract`, so these live here (co-located with the routes) rather
 *  than in the contract file. */
import { z } from "zod";

/** The aggregate/per-principal ledger picture — total + count + the four attribution breakdowns (µ$). */
export const CostSummarySchema = z.object({
  total: z.number(),
  count: z.number().int(),
  byPrincipal: z.record(z.string(), z.number()),
  byOperation: z.record(z.string(), z.number()),
  byAction: z.record(z.string(), z.number()),
  bySource: z.record(z.string(), z.number()),
});

/** The summary read responses (aggregate + per-principal) both wrap the summary under `summary`. */
export const CostSummaryBody = z.object({ summary: CostSummarySchema });

/** `GET /cost/summary/:userId` path params. */
export const UserIdParams = z.object({ userId: z.string() });

/** `POST /cost/event` success body — the event was recorded (or replayed). */
export const RecordEventBody = z.object({ ok: z.literal(true) });

/** `POST /cost/dedup` success body — `recorded:true` (fresh, 201) or `recorded:false` (a duplicate replay, 200). */
export const RecordDedupBody = z.object({ recorded: z.boolean() });
