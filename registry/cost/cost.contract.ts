/** The `cost` module's CONTRACT fragment — its `/api/cost/*` ops. Composed via `src/contract.ops.ts`. */
import type { RouteContract } from "@suluk/hono";

export const costOps = [
  { method: "get", path: "/api/cost/summary", name: "getCostSummary", summary: "The aggregate cost ledger (total + breakdown by principal / operation / action / source).", tags: ["Cost"], scopes: ["cost:read"], responses: [{ status: 200, description: "The aggregate cost summary." }] },
  { method: "get", path: "/api/cost/summary/:userId", name: "getUserCostSummary", summary: "What one principal cost you — the per-user cost summary.", tags: ["Cost"], scopes: ["cost:read"], responses: [{ status: 200, description: "The per-principal cost summary." }] },
  { method: "post", path: "/api/cost/event", name: "recordCostEvent", summary: "Record a per-request cost event (at-least-once; deduped on the idempotency key).", tags: ["Cost"], scopes: ["cost:read"], responses: [{ status: 200, description: "The cost event was recorded (or replayed)." }] },
  { method: "post", path: "/api/cost/dedup", name: "recordCostDedup", summary: "Record a cost dedup marker (the at-least-once ledger for webhook-driven costs).", tags: ["Cost"], scopes: ["cost:read"], responses: [{ status: 200, description: "The dedup marker was recorded." }] },
] satisfies readonly RouteContract[];
