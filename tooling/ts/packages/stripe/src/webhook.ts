/**
 * @deprecated MOVED to @suluk/payments (C048). Re-export shim — import `webhookRouter` / `STRIPE_EVENTS` from
 * `@suluk/payments` instead. (The router's event type is now `StripeWebhookEvent = { type; data? }`, a superset of the
 * old `{ type; data }`.)
 */
export {
  webhookRouter, STRIPE_EVENTS,
  type WebhookRouter, type WebhookHandler, type HandleResult, type StripeWebhookEvent,
} from "@suluk/payments";
