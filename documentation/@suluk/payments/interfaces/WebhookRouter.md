[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/payments](../README.md) / WebhookRouter

# Interface: WebhookRouter

Defined in: [tooling/ts/packages/payments/src/stripe-webhook.ts:60](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/payments/src/stripe-webhook.ts#L60)

## Methods

### handle()

> **handle**(`event`): `Promise`\<[`HandleResult`](HandleResult.md)\>

Defined in: [tooling/ts/packages/payments/src/stripe-webhook.ts:66](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/payments/src/stripe-webhook.ts#L66)

dispatch one verified event to its handler.

#### Parameters

##### event

[`StripeWebhookEvent`](StripeWebhookEvent.md)

#### Returns

`Promise`\<[`HandleResult`](HandleResult.md)\>

***

### on()

> **on**(`type`, `handler`): `WebhookRouter`

Defined in: [tooling/ts/packages/payments/src/stripe-webhook.ts:62](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/payments/src/stripe-webhook.ts#L62)

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

Defined in: [tooling/ts/packages/payments/src/stripe-webhook.ts:64](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/payments/src/stripe-webhook.ts#L64)

register a fallback for types with no specific handler; chainable.

#### Parameters

##### handler

[`WebhookHandler`](../type-aliases/WebhookHandler.md)

#### Returns

`WebhookRouter`
