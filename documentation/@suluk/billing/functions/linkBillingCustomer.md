[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / linkBillingCustomer

# Function: linkBillingCustomer()

> **linkBillingCustomer**(`db`, `userId`, `customerId`): `Promise`\<`void`\>

Defined in: [packages/billing/src/account.ts:39](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/billing/src/account.ts#L39)

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
