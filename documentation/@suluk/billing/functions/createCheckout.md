[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / createCheckout

# Function: createCheckout()

> **createCheckout**(`cfg`, `o`): `Promise`\<`string`\>

Defined in: [packages/billing/src/payments.ts:36](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/billing/src/payments.ts#L36)

Create a Stripe Checkout Session (one-time top-up) — the hosted FALLBACK to the on-site Payment Element. Reuses the
 user's existing customer or has Checkout create one, captures the billing address, and saves the card for future
 off-session use. Returns the hosted checkout URL.

## Parameters

### cfg

[`StripeConfig`](../interfaces/StripeConfig.md)

### o

[`CheckoutOpts`](../interfaces/CheckoutOpts.md)

## Returns

`Promise`\<`string`\>
