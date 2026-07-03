/**
 * The `credits` module's CONTRACT fragment — the full `/api/credits/*` surface. Composed into the app's v4 document +
 * scope gate via `src/contract.ops.ts` (the generator spreads every module's fragment). OWN your ops next to your routes.
 *
 * Every op with a live handler is DERIVED from its `@suluk/effect` route in `./credits.routes` — the single source of
 * truth for its responses. The success body + status AND the typed error responses (402 PaymentError { required, balance })
 * bubble up from the handler's success + error channels, so the doc / Scalar / SDK show the ACTUAL error shapes (not a
 * generic ProblemDetails) and the route + its contract can't drift.
 *
 * `getCredits` (the caller's OWN balance, GET /api/credits) has no route handler in `credits.routes.ts` — it's a
 * documented op the contract-matcher resolves the caller's `/api/credits/*` reads against — so it stays a plain literal
 * fragment here (there is no handler to migrate).
 */
import { z } from "zod";
import type { RouteContract } from "@suluk/hono";
import {
  getUserCreditsRoute,
  listTransactionsRoute,
  debitCreditsRoute,
  grantCreditsRoute,
} from "../routes/credits";

const Balance = z.object({ balance: z.number().int() });

export const creditsOps = [
  // ── reads ──
  // getCredits — the caller's OWN balance (no route handler; a documented public read the matcher resolves against).
  { method: "get", path: "/api/credits", name: "getCredits", summary: "The caller's credit balance.", tags: ["Credits"], scopes: ["credits:read"], cost: { components: [], infra: { "worker.request": 1, "d1.read": 1 }, settlement: { method: "rate-limited" } }, rateLimit: { windowMs: 60_000, maxRequests: 60, key: "principal" }, responses: [{ status: 200, description: "The current credit balance.", schema: Balance }] },
  getUserCreditsRoute.contract,
  listTransactionsRoute.contract,
  // ── writes ──
  debitCreditsRoute.contract,
  grantCreditsRoute.contract,
] satisfies readonly RouteContract[];
