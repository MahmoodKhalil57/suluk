[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/stripe](../README.md) / DiscountRejection

# ~~Type Alias: DiscountRejection~~

> **DiscountRejection** = `"no-discount"` \| `"non-positive-value"` \| `"percent-out-of-range"` \| `"below-minimum"`

Defined in: [pricing.ts:43](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/payments/src/pricing.ts#L43)

## Deprecated

@suluk/stripe is DEPRECATED and gutted (C048) — it is now a thin re-export shell over @suluk/payments
and will be REMOVED in the next major. Import everything below from `@suluk/payments` instead.

What moved to @suluk/payments (re-exported here for backward compatibility): the pricing primitives, the Stripe webhook
surface (signature verification + the event router), and the Stripe form-encoder/transport. What was DELETED (dead —
no consumer): the Stripe usage-billing (Billing Meters), the checkout-param builders, the shipping/tax adapters, the
`PaymentProvider`/`StripeLike` types, and `restStripe`/`retrievePaymentIntent`. Use `@suluk/payments`'
`PaymentConnector` (agnostic) or `stripeConnector` for payment flows.
