[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / setSubscriptionDefaultCard

# Function: setSubscriptionDefaultCard()

> **setSubscriptionDefaultCard**(`cfg`, `subscriptionId`, `pmId`): `Promise`\<`void`\>

Defined in: [packages/billing/src/billing.ts:134](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/billing/src/billing.ts#L134)

Point an ACTIVE subscription at `pmId` too, so changing the default card moves the recurring charge to it.

## Parameters

### cfg

[`StripeConfig`](../interfaces/StripeConfig.md)

### subscriptionId

`string`

### pmId

`string`

## Returns

`Promise`\<`void`\>
