[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / clearSubscription

# Function: clearSubscription()

> **clearSubscription**(`db`, `userId`): `Promise`\<`void`\>

Defined in: [packages/billing/src/account.ts:57](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/billing/src/account.ts#L57)

Clear the recorded subscription (on customer.subscription.deleted) — leaves the customer id (+ its saved card) intact.

## Parameters

### db

[`BillingDB`](../type-aliases/BillingDB.md)

### userId

`string`

## Returns

`Promise`\<`void`\>
