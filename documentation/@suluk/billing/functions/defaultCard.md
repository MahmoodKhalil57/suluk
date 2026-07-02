[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / defaultCard

# Function: defaultCard()

> **defaultCard**(`cfg`, `customerId`): `Promise`\<\{ `address`: [`TaxAddress`](../interfaces/TaxAddress.md) \| `null`; `pmId`: `string`; \} \| `null`\>

Defined in: [packages/billing/src/billing.ts:105](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/billing/src/billing.ts#L105)

The customer's DEFAULT saved card — its id (to charge) + its billing address (to locate tax). Graceful: a transient
 Stripe error returns null rather than blocking a top-up (this is only tax LOCATION / an off-session skip).

## Parameters

### cfg

[`StripeConfig`](../interfaces/StripeConfig.md)

### customerId

`string`

## Returns

`Promise`\<\{ `address`: [`TaxAddress`](../interfaces/TaxAddress.md) \| `null`; `pmId`: `string`; \} \| `null`\>
