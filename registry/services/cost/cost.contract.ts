/** The `cost` module's CONTRACT fragment — its `/api/cost/*` ops. Composed via `src/contract.ops.ts`.
 *
 *  Every op is DERIVED from its `@suluk/effect` route handler in `./cost.routes` — the single source of truth for its
 *  responses. The success body + status AND the typed error responses (400 ValidationError, with its own body schema) bubble up
 *  from the handler's success + error channels, so the doc / Scalar / SDK show the ACTUAL error shapes (not a generic
 *  ProblemDetails) and the route and its contract can't drift. */
import type { RouteContract } from "@suluk/hono";
import {
  getCostSummaryRoute, getUserCostSummaryRoute, recordCostEventRoute, recordCostDedupRoute,
} from "../routes/cost";

export const costOps = [
  getCostSummaryRoute.contract,
  getUserCostSummaryRoute.contract,
  recordCostEventRoute.contract,
  recordCostDedupRoute.contract,
] satisfies readonly RouteContract[];
