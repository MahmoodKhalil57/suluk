[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / setSubscriptionCancel

# Function: setSubscriptionCancel()

> **setSubscriptionCancel**(`cfg`, `subscriptionId`, `cancel`): `Promise`\<`void`\>

Defined in: [packages/billing/src/billing.ts:146](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/billing/src/billing.ts#L146)

Schedule the subscription to cancel at the period end (`cancel=true`) or resume it (`cancel=false`).

## Parameters

### cfg

[`StripeConfig`](../interfaces/StripeConfig.md)

### subscriptionId

`string`

### cancel

`boolean`

## Returns

`Promise`\<`void`\>
