[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/payments](../README.md) / StripeConfig

# Interface: StripeConfig

Defined in: [tooling/ts/packages/payments/src/stripe-transport.ts:8](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/payments/src/stripe-transport.ts#L8)

The low-level Stripe HTTP transport (C048) — the fetch-based Stripe client the [stripeConnector](../variables/stripeConnector.md) rides, exported
so an app's Stripe-PLATFORM operations (hosted Checkout, subscriptions, saved-card management, Tax — the things the
agnostic PaymentConnector deliberately doesn't model) ride the SAME client instead of a separate legacy one. This is
intentionally Stripe-specific: agnostic payment FLOWS go through the connector, these platform ops through this
transport — one Stripe roof, no accidental second path. Workers-native (fetch + x-www-form-urlencoded), zero deps.

## Properties

### fetch?

> `optional` **fetch?**: *typeof* `fetch`

Defined in: [tooling/ts/packages/payments/src/stripe-transport.ts:11](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/payments/src/stripe-transport.ts#L11)

the HTTP transport — a mock in tests; defaults to the global `fetch` in prod.

***

### secretKey

> **secretKey**: `string`

Defined in: [tooling/ts/packages/payments/src/stripe-transport.ts:9](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/payments/src/stripe-transport.ts#L9)
