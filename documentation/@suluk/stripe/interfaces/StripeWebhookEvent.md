[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/stripe](../README.md) / StripeWebhookEvent

# Interface: StripeWebhookEvent

Defined in: [stripe-webhook.ts:47](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/payments/src/stripe-webhook.ts#L47)

A verified webhook event — only `type` is required (the router dispatches on it); `data` carries the payload.

## Properties

### data?

> `optional` **data?**: `unknown`

Defined in: [stripe-webhook.ts:49](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/payments/src/stripe-webhook.ts#L49)

***

### type

> **type**: `string`

Defined in: [stripe-webhook.ts:48](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/payments/src/stripe-webhook.ts#L48)
