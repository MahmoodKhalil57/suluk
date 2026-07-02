[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / clearSubscription

# Function: clearSubscription()

> **clearSubscription**(`db`, `userId`): `Promise`\<`void`\>

Defined in: [packages/billing/src/account.ts:57](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/billing/src/account.ts#L57)

Clear the recorded subscription (on customer.subscription.deleted) — leaves the customer id (+ its saved card) intact.

## Parameters

### db

[`BillingDB`](../type-aliases/BillingDB.md)

### userId

`string`

## Returns

`Promise`\<`void`\>
