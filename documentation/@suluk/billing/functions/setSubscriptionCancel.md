[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / setSubscriptionCancel

# Function: setSubscriptionCancel()

> **setSubscriptionCancel**(`cfg`, `subscriptionId`, `cancel`): `Promise`\<`void`\>

Defined in: [packages/billing/src/billing.ts:146](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/billing/src/billing.ts#L146)

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
