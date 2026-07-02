[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/stripe](../README.md) / OrderTotal

# ~~Interface: OrderTotal~~

Defined in: [pricing.ts:45](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/payments/src/pricing.ts#L45)

## Deprecated

@suluk/stripe is DEPRECATED and gutted (C048) — it is now a thin re-export shell over @suluk/payments
and will be REMOVED in the next major. Import everything below from `@suluk/payments` instead.

What moved to @suluk/payments (re-exported here for backward compatibility): the pricing primitives, the Stripe webhook
surface (signature verification + the event router), and the Stripe form-encoder/transport. What was DELETED (dead —
no consumer): the Stripe usage-billing (Billing Meters), the checkout-param builders, the shipping/tax adapters, the
`PaymentProvider`/`StripeLike` types, and `restStripe`/`retrievePaymentIntent`. Use `@suluk/payments`'
`PaymentConnector` (agnostic) or `stripeConnector` for payment flows.

## Properties

### ~~discountCents~~

> **discountCents**: `number`

Defined in: [pricing.ts:45](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/payments/src/pricing.ts#L45)

***

### ~~subtotalCents~~

> **subtotalCents**: `number`

Defined in: [pricing.ts:45](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/payments/src/pricing.ts#L45)

***

### ~~totalCents~~

> **totalCents**: `number`

Defined in: [pricing.ts:45](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/payments/src/pricing.ts#L45)
