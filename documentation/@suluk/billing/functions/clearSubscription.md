[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / clearSubscription

# Function: clearSubscription()

> **clearSubscription**(`db`, `userId`): `Promise`\<`void`\>

Defined in: [packages/billing/src/account.ts:57](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/billing/src/account.ts#L57)

Clear the recorded subscription (on customer.subscription.deleted) — leaves the customer id (+ its saved card) intact.

## Parameters

### db

[`BillingDB`](../type-aliases/BillingDB.md)

### userId

`string`

## Returns

`Promise`\<`void`\>
