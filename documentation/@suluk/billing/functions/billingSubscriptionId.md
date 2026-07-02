[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / billingSubscriptionId

# Function: billingSubscriptionId()

> **billingSubscriptionId**(`db`, `userId`): `Promise`\<`string` \| `null`\>

Defined in: [packages/billing/src/account.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/billing/src/account.ts#L32)

The user's recorded Stripe subscription id, or null when they have no subscription.

## Parameters

### db

[`BillingDB`](../type-aliases/BillingDB.md)

### userId

`string`

## Returns

`Promise`\<`string` \| `null`\>
