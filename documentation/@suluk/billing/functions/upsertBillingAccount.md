[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / upsertBillingAccount

# Function: upsertBillingAccount()

> **upsertBillingAccount**(`db`, `userId`, `customerId`, `subscriptionId`): `Promise`\<`void`\>

Defined in: [packages/billing/src/account.ts:48](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/billing/src/account.ts#L48)

Persist customer + subscription together (the subscribe path sets both). Idempotent on the userId PK.

## Parameters

### db

[`BillingDB`](../type-aliases/BillingDB.md)

### userId

`string`

### customerId

`string`

### subscriptionId

`string` \| `null`

## Returns

`Promise`\<`void`\>
