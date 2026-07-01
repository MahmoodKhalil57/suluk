[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/stripe](../README.md) / DiscountResult

# ~~Interface: DiscountResult~~

Defined in: [pricing.ts:42](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/payments/src/pricing.ts#L42)

## Deprecated

@suluk/stripe is DEPRECATED and gutted (C048) — it is now a thin re-export shell over @suluk/payments
and will be REMOVED in the next major. Import everything below from `@suluk/payments` instead.

What moved to @suluk/payments (re-exported here for backward compatibility): the pricing primitives, the Stripe webhook
surface (signature verification + the event router), and the Stripe form-encoder/transport. What was DELETED (dead —
no consumer): the Stripe usage-billing (Billing Meters), the checkout-param builders, the shipping/tax adapters, the
`PaymentProvider`/`StripeLike` types, and `restStripe`/`retrievePaymentIntent`. Use `@suluk/payments`'
`PaymentConnector` (agnostic) or `stripeConnector` for payment flows.

## Properties

### ~~amountCents~~

> **amountCents**: `number`

Defined in: [pricing.ts:42](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/payments/src/pricing.ts#L42)

***

### ~~reason?~~

> `optional` **reason?**: [`DiscountRejection`](../type-aliases/DiscountRejection.md)

Defined in: [pricing.ts:42](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/payments/src/pricing.ts#L42)

***

### ~~valid~~

> **valid**: `boolean`

Defined in: [pricing.ts:42](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/payments/src/pricing.ts#L42)
