[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / chargeOffSession

# Function: chargeOffSession()

> **chargeOffSession**(`cfg`, `customerId`, `pmId`, `amountCents`, `meta`): `Promise`\<\{ `authRequired`: `boolean`; `id`: `string` \| `null`; `status`: `string` \| `null`; \}\>

Defined in: [packages/billing/src/payments.ts:122](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/billing/src/payments.ts#L122)

An OFF-SESSION charge on a saved card (auto-top-up). Confirms immediately; metadata carries who + credits + `source`
 so the payment_intent.succeeded webhook credits idempotently on the SAME `pi:<id>` key. Returns the PaymentIntent id +
 status, plus `authRequired` when the card needs 3DS (a decline to NOTIFY, not throw on). A hard 402 card decline is
 also returned (not thrown) so the caller can alert; a transient/transport failure throws (it may recover).

## Parameters

### cfg

[`StripeConfig`](../interfaces/StripeConfig.md)

### customerId

`string`

### pmId

`string`

### amountCents

`number`

### meta

[`TopupMeta`](../type-aliases/TopupMeta.md)

## Returns

`Promise`\<\{ `authRequired`: `boolean`; `id`: `string` \| `null`; `status`: `string` \| `null`; \}\>
