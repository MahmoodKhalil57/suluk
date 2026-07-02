[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / billingCustomerId

# Function: billingCustomerId()

> **billingCustomerId**(`db`, `userId`): `Promise`\<`string` \| `null`\>

Defined in: [packages/billing/src/account.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/billing/src/account.ts#L26)

The user's Stripe customer id, or null when they have no billing account yet.

## Parameters

### db

[`BillingDB`](../type-aliases/BillingDB.md)

### userId

`string`

## Returns

`Promise`\<`string` \| `null`\>
