[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/payments](../README.md) / StripeWebhookEvent

# Interface: StripeWebhookEvent

Defined in: [tooling/ts/packages/payments/src/stripe-webhook.ts:47](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/stripe-webhook.ts#L47)

A verified webhook event — only `type` is required (the router dispatches on it); `data` carries the payload.

## Properties

### data?

> `optional` **data?**: `unknown`

Defined in: [tooling/ts/packages/payments/src/stripe-webhook.ts:49](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/stripe-webhook.ts#L49)

***

### type

> **type**: `string`

Defined in: [tooling/ts/packages/payments/src/stripe-webhook.ts:48](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/stripe-webhook.ts#L48)
