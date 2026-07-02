[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/stripe](../README.md) / webhookRouter

# Function: webhookRouter()

> **webhookRouter**(`handlers?`): [`WebhookRouter`](../interfaces/WebhookRouter.md)

Defined in: [stripe-webhook.ts:70](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/payments/src/stripe-webhook.ts#L70)

Build a router, optionally seeded with a `{ type → handler }` map.

## Parameters

### handlers?

`Record`\<`string`, [`WebhookHandler`](../type-aliases/WebhookHandler.md)\> = `{}`

## Returns

[`WebhookRouter`](../interfaces/WebhookRouter.md)
