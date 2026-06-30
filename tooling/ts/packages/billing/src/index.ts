/**
 * @suluk/billing — Stripe plumbing over an injected config (C046, v1). The clean transport + the customer/intent creation
 * + the saved-card surface, ported with the source's `res.ok`/field semantics verbatim (the Effect-Schema defensive
 * decode dropped, so no `effect` dep). The money-MOVING paths, the pricing-woven subscription logic, the webhook
 * dispatch, the credit grant, email, and the billing-account DB linking stay in the app (the careful follow-on).
 */
export { type StripeConfig, stripePost, stripeGet, toForm } from "./transport";
export {
  createCustomer, createSetupIntent, createPaymentIntent,
  listPaymentMethods, defaultCard, defaultPaymentMethodId, ownsPaymentMethod,
  setDefaultPaymentMethod, setSubscriptionDefaultCard, detachPaymentMethod,
  setSubscriptionCancel, payOpenInvoice,
  type PaymentMethodWire, type TaxAddress,
} from "./billing";
