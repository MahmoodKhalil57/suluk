[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / listPaymentMethods

# Function: listPaymentMethods()

> **listPaymentMethods**(`cfg`, `customerId`): `Promise`\<[`PaymentMethodWire`](../interfaces/PaymentMethodWire.md)[]\>

Defined in: [packages/billing/src/billing.ts:75](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/billing/src/billing.ts#L75)

List a customer's saved cards (each with its billing address), marking the invoice default.

## Parameters

### cfg

[`StripeConfig`](../interfaces/StripeConfig.md)

### customerId

`string`

## Returns

`Promise`\<[`PaymentMethodWire`](../interfaces/PaymentMethodWire.md)[]\>
