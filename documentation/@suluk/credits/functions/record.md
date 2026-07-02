[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/credits](../README.md) / record

# Function: record()

> **record**(`db`, `userId`, `delta`, `reason`): `Promise`\<`string`\>

Defined in: [tooling/ts/packages/credits/src/credits.ts:36](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/credits/src/credits.ts#L36)

Append one ledger row (the single writer); returns the new row id. `delta` is + on grant/top-up, − on debit.

## Parameters

### db

[`CreditsDB`](../type-aliases/CreditsDB.md)

### userId

`string`

### delta

`number`

### reason

`string`

## Returns

`Promise`\<`string`\>
