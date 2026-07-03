/** The `billing` module's CONTRACT fragment — the full `/api/billing/*` surface. Composed via `src/contract.ops.ts`
 *  (own your ops next to your routes; scopes: read for GET, write for POST).
 *
 *  Every op is DERIVED from its `@suluk/effect` route handler in `./billing.routes` — the single source of truth for its
 *  responses. The success body + status AND the typed error responses (401 UnauthorizedError / 400 ValidationError /
 *  404 NotFoundError, each with its own body schema) bubble up from the handler's success + error channels, so the doc /
 *  Scalar / SDK show the ACTUAL error shapes (not a generic ProblemDetails) and the route and its contract can't drift. */
import type { RouteContract } from "@suluk/hono";
import {
  getPacksRoute, getPlansRoute, getPaymentConfigRoute,
  checkoutRoute, createPaymentIntentRoute,
  subscribeRoute, getSubscriptionRoute, cancelSubscriptionRoute, changeSubscriptionPlanRoute,
  getPurchaseQuoteRoute, getRefundQuoteRoute,
  refundRoute,
  listCardsRoute, listMethodsRoute, setDefaultMethodRoute, deleteMethodRoute,
  billingPortalRoute,
  ensureCustomerRoute, createPaymentSessionRoute, createSetupSessionRoute,
  getAutoTopupRoute, setAutoTopupRoute,
  getPaymentHealthRoute,
} from "../routes/billing";

export const billingOps = [
  // ── pricing (public) ──
  getPacksRoute.contract,
  getPlansRoute.contract,
  getPaymentConfigRoute.contract,
  // ── top-up ──
  checkoutRoute.contract,
  createPaymentIntentRoute.contract,
  // ── subscriptions ──
  subscribeRoute.contract,
  getSubscriptionRoute.contract,
  cancelSubscriptionRoute.contract,
  changeSubscriptionPlanRoute.contract,
  // ── quotes ──
  getPurchaseQuoteRoute.contract,
  getRefundQuoteRoute.contract,
  // ── refund ──
  refundRoute.contract,
  // ── cards / methods ──
  listCardsRoute.contract,
  listMethodsRoute.contract,
  setDefaultMethodRoute.contract,
  deleteMethodRoute.contract,
  // ── portal ──
  billingPortalRoute.contract,
  // ── customer + sessions ──
  ensureCustomerRoute.contract,
  createPaymentSessionRoute.contract,
  createSetupSessionRoute.contract,
  // ── auto-topup ──
  getAutoTopupRoute.contract,
  setAutoTopupRoute.contract,
  // ── payment-health ──
  getPaymentHealthRoute.contract,
] satisfies readonly RouteContract[];
