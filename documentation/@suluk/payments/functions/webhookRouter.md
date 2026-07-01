[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/payments](../README.md) / webhookRouter

# Function: webhookRouter()

> **webhookRouter**(`handlers?`): [`WebhookRouter`](../interfaces/WebhookRouter.md)

Defined in: [tooling/ts/packages/payments/src/stripe-webhook.ts:70](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/payments/src/stripe-webhook.ts#L70)

Build a router, optionally seeded with a `{ type → handler }` map.

## Parameters

### handlers?

`Record`\<`string`, [`WebhookHandler`](../type-aliases/WebhookHandler.md)\> = `{}`

## Returns

[`WebhookRouter`](../interfaces/WebhookRouter.md)
