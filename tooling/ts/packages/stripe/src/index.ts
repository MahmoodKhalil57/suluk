/**
 * @suluk/stripe — first-class Stripe behind a swappable PaymentProvider. Usage-based billing via the modern
 * Billing Meters API (meters + meter events + metered prices), customers, subscriptions, and webhooks — plus
 * a bridge that turns @suluk/cost events into the usage you bill on. Stripe is the reference processor; the
 * PaymentProvider interface is the swap point for the others that follow it. CANDIDATE tooling.
 */
export type { PaymentProvider, StripeLike, Customer, Subscription, WebhookEvent } from "./types";
export {
  customerParams, productParams, meterParams, meteredPriceParams, subscriptionParams, meterEventParams,
  billingPortalSessionParams, setupUsageBilling, stripeProvider, usageEventsFromCost, reportCostUsage,
  type UsageBillingConfig, type CostBillingConfig,
} from "./stripe";
export {
  subtotal, computeDiscountAmount, validateDiscount, prorateDiscount, orderTotal, composeTotal, verifyAmount,
  cartFingerprint, idempotencyKey, requiresStripe, STRIPE_MIN_CHARGE_CENTS,
  type CartLine, type Discount, type DiscountResult, type DiscountRejection, type OrderTotal, type OrderTotalFull, type AmountVerdict,
} from "./pricing";
// pluggable shipping + tax adapters — swap flat-rate for Shippo/EasyPost/TaxJar/Stripe-Tax without touching checkout.
export {
  cartNeedsShipping, flatRateShipping, combineShipping, resolveShipping,
  type ShippingInput, type ShippingOption, type ShippingProvider,
} from "./shipping";
export {
  flatRateTax, noTax, resolveTax,
  type TaxInput, type TaxResult, type TaxProvider,
} from "./tax";
// the checkout money-path (Phase 1): the pure anti-double-charge / anti-tampering core + the Stripe binding.
export {
  planPaymentIntent, cardInfoFrom, ownsPaymentMethod, stripeCheckout,
  type IntentPlan, type CardInfo, type CheckoutProvider,
  type StripeCheckoutLike, type PaymentMethodLike, type PaymentIntentLike,
} from "./checkout";
export { webhookRouter, STRIPE_EVENTS, type WebhookRouter, type WebhookHandler, type HandleResult } from "./webhook";
