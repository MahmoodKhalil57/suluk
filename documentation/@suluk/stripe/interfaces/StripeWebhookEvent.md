[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/stripe](../README.md) / StripeWebhookEvent

# Interface: StripeWebhookEvent

Defined in: [stripe-webhook.ts:47](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/payments/src/stripe-webhook.ts#L47)

A verified webhook event — only `type` is required (the router dispatches on it); `data` carries the payload.

## Properties

### data?

> `optional` **data?**: `unknown`

Defined in: [stripe-webhook.ts:49](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/payments/src/stripe-webhook.ts#L49)

***

### type

> **type**: `string`

Defined in: [stripe-webhook.ts:48](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/payments/src/stripe-webhook.ts#L48)
