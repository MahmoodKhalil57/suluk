/**
 * The `admin` module's CONTRACT fragment — its `/api/admin/*` op. Composed via `src/contract.ops.ts`.
 *
 * The `getAdminStats` op is DERIVED from its `@suluk/effect` route in `../routes/admin` — the single source of truth for its
 * response. The success body + status bubble up from the handler's success channel (it's a pure read with no in-handler
 * failure branch → no typed errors; admin-scope is enforced GLOBALLY by the contract gate), so the route + its contract
 * can't drift.
 */
import type { RouteContract } from "@suluk/hono";
import { getAdminStatsRoute } from "../routes/admin";

export const adminOps = [
  getAdminStatsRoute.contract,
] satisfies readonly RouteContract[];
