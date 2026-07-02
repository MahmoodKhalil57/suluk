[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/stripe](../README.md) / WebhookRouter

# Interface: WebhookRouter

Defined in: [stripe-webhook.ts:60](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/payments/src/stripe-webhook.ts#L60)

## Methods

### handle()

> **handle**(`event`): `Promise`\<[`HandleResult`](HandleResult.md)\>

Defined in: [stripe-webhook.ts:66](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/payments/src/stripe-webhook.ts#L66)

dispatch one verified event to its handler.

#### Parameters

##### event

[`StripeWebhookEvent`](StripeWebhookEvent.md)

#### Returns

`Promise`\<[`HandleResult`](HandleResult.md)\>

***

### on()

> **on**(`type`, `handler`): `WebhookRouter`

Defined in: [stripe-webhook.ts:62](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/payments/src/stripe-webhook.ts#L62)

register (or replace) the handler for an event type; chainable.

#### Parameters

##### type

`string`

##### handler

[`WebhookHandler`](../type-aliases/WebhookHandler.md)

#### Returns

`WebhookRouter`

***

### onUnhandled()

> **onUnhandled**(`handler`): `WebhookRouter`

Defined in: [stripe-webhook.ts:64](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/payments/src/stripe-webhook.ts#L64)

register a fallback for types with no specific handler; chainable.

#### Parameters

##### handler

[`WebhookHandler`](../type-aliases/WebhookHandler.md)

#### Returns

`WebhookRouter`
