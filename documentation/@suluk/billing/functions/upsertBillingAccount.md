[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / upsertBillingAccount

# Function: upsertBillingAccount()

> **upsertBillingAccount**(`db`, `userId`, `customerId`, `subscriptionId`): `Promise`\<`void`\>

Defined in: [packages/billing/src/account.ts:48](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/billing/src/account.ts#L48)

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
