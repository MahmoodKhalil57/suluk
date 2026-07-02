/**
 * `@suluk/payments` — provider-agnostic payments for a Suluk app (C048). A Workers-native TypeScript reimplementation of the
 * Hyperswitch Prism connector interface: ONE unified request schema (authorize / capture / void / refund / sync + the
 * optional customer / tokenize / recurring / webhook surfaces), and you switch processor by CONFIG, not code. Prism itself
 * is a native FFI addon that can't run on the edge, so we adopt its interface + status semantics (integer-exact) and
 * implement over `fetch` — zero native deps, light, swappable. This barrel is the INTERFACE + a mock connector; the real
 * connectors (stripe, adyen, …) and the @suluk/billing rewire that deprecates @suluk/stripe are the follow-on builds.
 */
export * from "./types";
export { IntegrationError, ConnectorError, NetworkError, PaymentLibError } from "./errors";
export {
  paymentClient,
  type PaymentConnector, type ConnectorConfig, type ConnectorAuth, type ConnectorFactory, type ConnectorRegistry,
  type HttpOptions, type WebhookEvent,
} from "./connector";
export { mockConnector, MOCK_DECLINE_CARD, MOCK_3DS_CARD } from "./mock";
// the built-in Stripe connector (the first real backend; fetch → Stripe REST, Workers-native).
export { stripeConnector } from "./connectors/stripe";
// the low-level Stripe transport (one Stripe client) — for the Stripe-PLATFORM ops the agnostic seam doesn't model.
export { type StripeConfig, stripePost, stripeGet, toForm } from "./stripe-transport";
// pricing primitives — processor-agnostic checkout money math (moved from @suluk/stripe; anti-tampering, proration, …).
export {
  subtotal, computeDiscountAmount, validateDiscount, prorateDiscount, orderTotal, composeTotal, verifyAmount,
  cartFingerprint, idempotencyKey, requiresStripe, STRIPE_MIN_CHARGE_CENTS,
  type CartLine, type Discount, type DiscountResult, type DiscountRejection, type OrderTotal, type OrderTotalFull, type AmountVerdict,
} from "./pricing";
// Stripe FEE weights — the cost of USING Stripe, for the token weight table (2.9% + $0.30; the $0.30 is a static weight,
// the 2.9% is metered dynamically). Merge STRIPE_WEIGHTS into the app's table (see @suluk/cost mergeWeights).
export { STRIPE_WEIGHTS, STRIPE_CHARGE_FEE_MICRO_USD, STRIPE_PERCENT, stripePercentFee, stripeFee, MICRO_PER_USD } from "./weights";
// the Stripe webhook surface (SDK-free signature verification + a typed event router; moved from @suluk/stripe).
export {
  verifyStripeSignature, timingSafeHexEqual, webhookRouter, STRIPE_EVENTS,
  type VerifyOptions, type StripeWebhookEvent, type WebhookHandler, type WebhookRouter, type HandleResult,
} from "./stripe-webhook";
