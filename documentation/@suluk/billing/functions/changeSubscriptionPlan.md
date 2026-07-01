[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / changeSubscriptionPlan

# Function: changeSubscriptionPlan()

> **changeSubscriptionPlan**(`cfg`, `subscriptionId`, `newPlan`, `userId`, `plans`, `branding?`): `Promise`\<[`ChangePlanResult`](../interfaces/ChangePlanResult.md)\>

Defined in: [packages/billing/src/subscriptions.ts:159](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/billing/src/subscriptions.ts#L159)

## Parameters

### cfg

[`StripeConfig`](../interfaces/StripeConfig.md)

### subscriptionId

`string`

### newPlan

[`SubPlan`](../interfaces/SubPlan.md)

### userId

`string`

### plans

[`SubPlan`](../interfaces/SubPlan.md)[]

### branding?

[`SubscriptionBranding`](../interfaces/SubscriptionBranding.md)

## Returns

`Promise`\<[`ChangePlanResult`](../interfaces/ChangePlanResult.md)\>
