[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / listPaymentMethods

# Function: listPaymentMethods()

> **listPaymentMethods**(`cfg`, `customerId`): `Promise`\<[`PaymentMethodWire`](../interfaces/PaymentMethodWire.md)[]\>

Defined in: [packages/billing/src/billing.ts:75](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/billing/src/billing.ts#L75)

List a customer's saved cards (each with its billing address), marking the invoice default.

## Parameters

### cfg

[`StripeConfig`](../interfaces/StripeConfig.md)

### customerId

`string`

## Returns

`Promise`\<[`PaymentMethodWire`](../interfaces/PaymentMethodWire.md)[]\>
