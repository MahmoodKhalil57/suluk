/**
 * @suluk/billing — Stripe plumbing over an injected config (C046). The transport + customer/intent creation + the
 * saved-card surface (v1), plus the money-MOVING paths (hosted Checkout, portal, on-default-card top-up, off-session
 * charge), the pricing-woven subscription logic made generic over a SubPlan catalog, the Stripe Tax mechanics, and the
 * package-owned billing-account store (v2). Ported with the source's `res.ok`/field semantics verbatim; the Effect-Schema
 * defensive decode is dropped (plain typed JSON access → no `effect` dep). STAYS APP (policy, not library): the Stripe
 * WEBHOOK dispatch (composes @suluk/stripe webhookRouter + these primitives + @suluk/credits.grantOnce), the branded
 * email templates, payment-alert kinds, and refund/subscription-pooling (operator-excluded from the start).
 */
export { type StripeConfig, stripePost, stripeGet, toForm } from "./transport";
export {
  createCustomer, createSetupIntent, createPaymentIntent,
  listPaymentMethods, defaultCard, defaultPaymentMethodId, ownsPaymentMethod,
  setDefaultPaymentMethod, setSubscriptionDefaultCard, detachPaymentMethod,
  setSubscriptionCancel, payOpenInvoice,
  type PaymentMethodWire, type TaxAddress,
} from "./billing";
// v2 — money-moving Stripe primitives (app supplies product name + success/cancel/return URLs).
export {
  createCheckout, createSubscriptionCheckout, createPortalSessionForCustomer,
  createPaymentIntentOnDefaultCard, chargeOffSession,
  type CheckoutOpts, type SubscriptionCheckoutOpts, type TopupMeta,
} from "./payments";
// v2 — Stripe Tax mechanics (graceful: any failure → taxCents 0, the top-up always proceeds).
export { calculateTax, recordTaxTransaction, type TaxResult, type TaxLocation } from "./tax";
// v2 — subscription mechanics over a generic SubPlan catalog (the pricing matrix stays in the app).
export {
  type SubPlan, planById, planByPrice, ceilingFor, ensurePlanPrice, createSubscriptionOnDefaultCard,
  getSubscriptionStatus, changeSubscriptionPlan,
  type SubscriptionBranding, type SubscriptionStatus, type ChangePlanResult,
} from "./subscriptions";
// v2 — the package-owned billing-account store (the user ↔ Stripe link; the app injects a Drizzle handle).
export {
  billingAccount, type BillingDB,
  billingCustomerId, billingSubscriptionId, linkBillingCustomer, upsertBillingAccount, clearSubscription,
} from "./account";
