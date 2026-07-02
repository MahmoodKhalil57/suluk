[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / changeSubscriptionPlan

# Function: changeSubscriptionPlan()

> **changeSubscriptionPlan**(`cfg`, `subscriptionId`, `newPlan`, `userId`, `plans`, `branding?`): `Promise`\<[`ChangePlanResult`](../interfaces/ChangePlanResult.md)\>

Defined in: [packages/billing/src/subscriptions.ts:159](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/billing/src/subscriptions.ts#L159)

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
