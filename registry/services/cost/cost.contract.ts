/** The `cost` module's CONTRACT fragment — its `/api/cost/*` ops. Composed via `src/contract.ops.ts`. */
import { z } from "zod";
import type { RouteContract } from "@suluk/hono";

/** The aggregate/per-principal ledger picture — total + count + the four attribution breakdowns (µ$). */
const CostSummarySchema = z.object({
  total: z.number(),
  count: z.number().int(),
  byPrincipal: z.record(z.string(), z.number()),
  byOperation: z.record(z.string(), z.number()),
  byAction: z.record(z.string(), z.number()),
  bySource: z.record(z.string(), z.number()),
});

export const costOps = [
  { method: "get", path: "/api/cost/summary", name: "getCostSummary", summary: "The aggregate cost ledger (total + breakdown by principal / operation / action / source).", tags: ["Cost"], scopes: ["cost:read"], rateLimit: { windowMs: 60_000, maxRequests: 60, key: "principal" }, responses: [{ status: 200, description: "The aggregate cost summary.", schema: z.object({ summary: CostSummarySchema }) }] },
  { method: "get", path: "/api/cost/summary/:userId", name: "getUserCostSummary", summary: "What one principal cost you — the per-user cost summary.", tags: ["Cost"], scopes: ["cost:read"], rateLimit: { windowMs: 60_000, maxRequests: 60, key: "principal" }, request: { params: z.object({ userId: z.string() }) }, responses: [{ status: 200, description: "The per-principal cost summary.", schema: z.object({ summary: CostSummarySchema }) }] },
  { method: "post", path: "/api/cost/event", name: "recordCostEvent", summary: "Record a per-request cost event (at-least-once; deduped on the idempotency key).", tags: ["Cost"], scopes: ["cost:read"], rateLimit: { windowMs: 60_000, maxRequests: 120, key: "principal" }, errors: [400], responses: [{ status: 201, description: "The cost event was recorded (or replayed).", schema: z.object({ ok: z.literal(true) }) }] },
  { method: "post", path: "/api/cost/dedup", name: "recordCostDedup", summary: "Record a cost dedup marker (the at-least-once ledger for webhook-driven costs).", tags: ["Cost"], scopes: ["cost:read"], rateLimit: { windowMs: 60_000, maxRequests: 120, key: "principal" }, errors: [400], responses: [{ status: 201, description: "The dedup marker was recorded.", schema: z.object({ recorded: z.boolean() }) }, { status: 200, description: "A duplicate — the marker was already recorded (at-least-once replay).", schema: z.object({ recorded: z.literal(false) }) }] },
] satisfies readonly RouteContract[];
