[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / createPaymentIntent

# Function: createPaymentIntent()

> **createPaymentIntent**(`cfg`, `customerId`, `amountCents`, `meta`): `Promise`\<`string`\>

Defined in: [packages/billing/src/billing.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/billing/src/billing.ts#L30)

Create a PaymentIntent for an on-site one-time top-up (saves the card; the webhook credits it). Returns the client secret.

## Parameters

### cfg

[`StripeConfig`](../interfaces/StripeConfig.md)

### customerId

`string`

### amountCents

`number`

### meta

#### credits

`number`

#### taxCalculation?

`string` \| `null`

#### userId

`string`

## Returns

`Promise`\<`string`\>
