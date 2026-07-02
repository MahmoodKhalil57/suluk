[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/credits](../README.md) / listTransactions

# Function: listTransactions()

> **listTransactions**(`db`, `userId`, `limit?`): `Promise`\<[`LedgerEntry`](../interfaces/LedgerEntry.md)[]\>

Defined in: [tooling/ts/packages/credits/src/credits.ts:163](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/credits/src/credits.ts#L163)

The user's recent ledger rows (grants + debits) with the cash that moved, newest first — the "recent transactions" +
 the activity log. `limit` is generous (effectively "all" for a normal account).

## Parameters

### db

[`CreditsDB`](../type-aliases/CreditsDB.md)

### userId

`string`

### limit?

`number` = `250`

## Returns

`Promise`\<[`LedgerEntry`](../interfaces/LedgerEntry.md)[]\>
