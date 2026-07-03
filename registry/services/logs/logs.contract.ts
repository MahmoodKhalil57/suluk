/**
 * The `logs` module's CONTRACT fragment — its `/api/logs/*` ops. Composed via `src/contract.ops.ts`.
 *
 * Every op is DERIVED from its `@suluk/effect` route in `./logs.routes` — the single source of truth for its responses.
 * The success body + status bubble up from the handler's success channel (both are pure reads with no failure branch, so
 * `errors: []` and a 200), so the doc / Scalar / SDK can't drift from the route.
 */
import type { RouteContract } from "@suluk/hono";
import { listLogsRoute, queryLogsRoute } from "../routes/logs";

export const logsOps = [
  listLogsRoute.contract,
  queryLogsRoute.contract,
] satisfies readonly RouteContract[];
