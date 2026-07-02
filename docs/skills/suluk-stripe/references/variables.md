# Variables & Constants

## pricing

### `STRIPE_MIN_CHARGE_CENTS`
Stripe's minimum chargeable amount (USD). Below it, a charge is impossible — the order must go the free path.
```ts
const STRIPE_MIN_CHARGE_CENTS: 50
```

## stripe-webhook

### `STRIPE_EVENTS`
The common Stripe checkout/billing event types (for discoverability + typo-safe registration).
```ts
const STRIPE_EVENTS: { checkoutCompleted: "checkout.session.completed"; checkoutExpired: "checkout.session.expired"; paymentSucceeded: "payment_intent.succeeded"; paymentFailed: "payment_intent.payment_failed"; chargeRefunded: "charge.refunded"; disputeClosed: "charge.dispute.closed"; setupSucceeded: "setup_intent.succeeded"; subscriptionUpdated: "customer.subscription.updated"; subscriptionDeleted: "customer.subscription.deleted"; invoicePaid: "invoice.paid" }
```
