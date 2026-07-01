[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/stripe](../README.md) / StripeWebhookEvent

# Interface: StripeWebhookEvent

Defined in: [stripe-webhook.ts:47](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/payments/src/stripe-webhook.ts#L47)

A verified webhook event — only `type` is required (the router dispatches on it); `data` carries the payload.

## Properties

### data?

> `optional` **data?**: `unknown`

Defined in: [stripe-webhook.ts:49](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/payments/src/stripe-webhook.ts#L49)

***

### type

> **type**: `string`

Defined in: [stripe-webhook.ts:48](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/payments/src/stripe-webhook.ts#L48)
