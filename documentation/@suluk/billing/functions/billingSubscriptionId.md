[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / billingSubscriptionId

# Function: billingSubscriptionId()

> **billingSubscriptionId**(`db`, `userId`): `Promise`\<`string` \| `null`\>

Defined in: [packages/billing/src/account.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/billing/src/account.ts#L32)

The user's recorded Stripe subscription id, or null when they have no subscription.

## Parameters

### db

[`BillingDB`](../type-aliases/BillingDB.md)

### userId

`string`

## Returns

`Promise`\<`string` \| `null`\>
