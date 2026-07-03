/** The `erasure` module's CONTRACT fragment — its `/api/erasure/*` op. Composed via `src/contract.ops.ts`.
 *
 *  The op is DERIVED from its `@suluk/effect` route handler in `./erasure.routes` — the single source of truth for its
 *  response. The success body + status bubble up from the handler's success channel (the fail-closed 500 is a DEFECT, not a
 *  typed error, so it's rendered as Problem-Details by the handler and not listed here), so the route and its contract can't
 *  drift. */
import type { RouteContract } from "@suluk/hono";
import { eraseUserRoute } from "../routes/erasure";

export const erasureOps = [
  eraseUserRoute.contract,
] satisfies readonly RouteContract[];
