[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/payments](../README.md) / webhookRouter

# Function: webhookRouter()

> **webhookRouter**(`handlers?`): [`WebhookRouter`](../interfaces/WebhookRouter.md)

Defined in: [tooling/ts/packages/payments/src/stripe-webhook.ts:70](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/payments/src/stripe-webhook.ts#L70)

Build a router, optionally seeded with a `{ type → handler }` map.

## Parameters

### handlers?

`Record`\<`string`, [`WebhookHandler`](../type-aliases/WebhookHandler.md)\> = `{}`

## Returns

[`WebhookRouter`](../interfaces/WebhookRouter.md)
