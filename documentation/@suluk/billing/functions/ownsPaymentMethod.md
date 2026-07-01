[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / ownsPaymentMethod

# Function: ownsPaymentMethod()

> **ownsPaymentMethod**(`cfg`, `customerId`, `pmId`): `Promise`\<`boolean`\>

Defined in: [packages/billing/src/billing.ts:123](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/billing/src/billing.ts#L123)

Whether `pmId` belongs to `customerId` — guards set-default / detach against another customer's card.

## Parameters

### cfg

[`StripeConfig`](../interfaces/StripeConfig.md)

### customerId

`string`

### pmId

`string`

## Returns

`Promise`\<`boolean`\>
