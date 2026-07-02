[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / setSubscriptionCancel

# Function: setSubscriptionCancel()

> **setSubscriptionCancel**(`cfg`, `subscriptionId`, `cancel`): `Promise`\<`void`\>

Defined in: [packages/billing/src/billing.ts:146](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/billing/src/billing.ts#L146)

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
