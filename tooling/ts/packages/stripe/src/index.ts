/**
 * @deprecated @suluk/stripe is DEPRECATED and gutted (C048) — it is now a thin re-export shell over {@link @suluk/payments}
 * and will be REMOVED in the next major. Import everything below from `@suluk/payments` instead.
 *
 * What moved to @suluk/payments (re-exported here for backward compatibility): the pricing primitives, the Stripe webhook
 * surface (signature verification + the event router), and the Stripe form-encoder/transport. What was DELETED (dead —
 * no consumer): the Stripe usage-billing (Billing Meters), the checkout-param builders, the shipping/tax adapters, the
 * `PaymentProvider`/`StripeLike` types, and `restStripe`/`retrievePaymentIntent`. Use `@suluk/payments`'
 * `PaymentConnector` (agnostic) or `stripeConnector` for payment flows.
 */

// pricing primitives (processor-agnostic checkout money math).
export {
  subtotal, computeDiscountAmount, validateDiscount, prorateDiscount, orderTotal, composeTotal, verifyAmount,
  cartFingerprint, idempotencyKey, requiresStripe, STRIPE_MIN_CHARGE_CENTS,
  type CartLine, type Discount, type DiscountResult, type DiscountRejection, type OrderTotal, type OrderTotalFull, type AmountVerdict,
} from "@suluk/payments";

// the Stripe webhook surface (SDK-free signature verification + a typed event router).
export {
  verifyStripeSignature, timingSafeHexEqual, webhookRouter, STRIPE_EVENTS,
  type VerifyOptions, type StripeWebhookEvent, type WebhookHandler, type WebhookRouter, type HandleResult,
} from "@suluk/payments";

// the Stripe form-encoder + transport.
export { toForm, stripePost, stripeGet, type StripeConfig } from "@suluk/payments";
