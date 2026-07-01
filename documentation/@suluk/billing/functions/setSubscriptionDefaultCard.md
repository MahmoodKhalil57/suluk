[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / setSubscriptionDefaultCard

# Function: setSubscriptionDefaultCard()

> **setSubscriptionDefaultCard**(`cfg`, `subscriptionId`, `pmId`): `Promise`\<`void`\>

Defined in: [packages/billing/src/billing.ts:134](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/billing/src/billing.ts#L134)

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
