[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / linkBillingCustomer

# Function: linkBillingCustomer()

> **linkBillingCustomer**(`db`, `userId`, `customerId`): `Promise`\<`void`\>

Defined in: [packages/billing/src/account.ts:39](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/billing/src/account.ts#L39)

Persist the user's Stripe customer id WITHOUT touching subscriptionId — so a one-time top-up never clears a
 subscriber's `subscriptionId` (unlike [upsertBillingAccount](upsertBillingAccount.md), which sets it). Idempotent on the userId PK.

## Parameters

### db

[`BillingDB`](../type-aliases/BillingDB.md)

### userId

`string`

### customerId

`string`

## Returns

`Promise`\<`void`\>
