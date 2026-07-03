/**
 * The `email` module's CONTRACT fragment — its `/api/email/*` op. Composed via `src/contract.ops.ts`.
 *
 * The `sendEmail` op is DERIVED from its `@suluk/effect` route in `./email.routes` — the single source of truth for its
 * responses: the success body + status AND the typed error response (502 ExternalServiceError { provider, detail }) bubble
 * up from the handler's success + error channels, so the doc / Scalar / SDK show the ACTUAL error shape (not a generic
 * ProblemDetails) and the route + its contract can't drift.
 */
import type { RouteContract } from "@suluk/hono";
import { sendEmailRoute } from "../routes/email";

export const emailOps = [
  sendEmailRoute.contract,
] satisfies readonly RouteContract[];
