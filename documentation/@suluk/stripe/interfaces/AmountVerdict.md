[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/stripe](../README.md) / AmountVerdict

# ~~Interface: AmountVerdict~~

Defined in: [pricing.ts:46](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/pricing.ts#L46)

## Deprecated

@suluk/stripe is DEPRECATED and gutted (C048) — it is now a thin re-export shell over @suluk/payments
and will be REMOVED in the next major. Import everything below from `@suluk/payments` instead.

What moved to @suluk/payments (re-exported here for backward compatibility): the pricing primitives, the Stripe webhook
surface (signature verification + the event router), and the Stripe form-encoder/transport. What was DELETED (dead —
no consumer): the Stripe usage-billing (Billing Meters), the checkout-param builders, the shipping/tax adapters, the
`PaymentProvider`/`StripeLike` types, and `restStripe`/`retrievePaymentIntent`. Use `@suluk/payments`'
`PaymentConnector` (agnostic) or `stripeConnector` for payment flows.

## Properties

### ~~claimedCents~~

> **claimedCents**: `number`

Defined in: [pricing.ts:46](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/pricing.ts#L46)

***

### ~~deltaCents~~

> **deltaCents**: `number`

Defined in: [pricing.ts:46](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/pricing.ts#L46)

***

### ~~expectedCents~~

> **expectedCents**: `number`

Defined in: [pricing.ts:46](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/pricing.ts#L46)

***

### ~~ok~~

> **ok**: `boolean`

Defined in: [pricing.ts:46](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/pricing.ts#L46)

***

### ~~reason?~~

> `optional` **reason?**: `"amount-mismatch"`

Defined in: [pricing.ts:46](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/pricing.ts#L46)
