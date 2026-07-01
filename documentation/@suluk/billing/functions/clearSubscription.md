[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / clearSubscription

# Function: clearSubscription()

> **clearSubscription**(`db`, `userId`): `Promise`\<`void`\>

Defined in: [packages/billing/src/account.ts:57](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/billing/src/account.ts#L57)

Clear the recorded subscription (on customer.subscription.deleted) — leaves the customer id (+ its saved card) intact.

## Parameters

### db

[`BillingDB`](../type-aliases/BillingDB.md)

### userId

`string`

## Returns

`Promise`\<`void`\>
