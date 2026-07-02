# Variables & Constants

## types

### `Currency`
ISO-4217 currency. A curated set for `Currency.USD`-style access; open to any code a connector accepts.
```ts
const Currency: { USD: "USD"; EUR: "EUR"; GBP: "GBP"; AED: "AED"; SAR: "SAR"; INR: "INR"; CAD: "CAD"; AUD: "AUD" }
```

## mock

### `mockConnector`
```ts
const mockConnector: ConnectorFactory
```

### `MOCK_DECLINE_CARD`
Well-known test PANs (Stripe-compatible values, for familiarity).
```ts
const MOCK_DECLINE_CARD: "4000000000000002"
```

### `MOCK_3DS_CARD`
```ts
const MOCK_3DS_CARD: "4000000000003220"
```

## connectors

### `stripeConnector`
```ts
const stripeConnector: ConnectorFactory
```

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
