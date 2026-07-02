[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/credits](../README.md) / debitCredits

# Function: debitCredits()

> **debitCredits**(`db`, `userId`, `amount`, `reason`): `Promise`\<`number`\>

Defined in: [tooling/ts/packages/credits/src/credits.ts:238](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/credits/src/credits.ts#L238)

Debit credits if the balance covers it; throws InsufficientCreditsError otherwise. Returns the new balance.
NOTE: read-then-write — fine at low concurrency; use [debitIfCovers](debitIfCovers.md) for the concurrency-safe atomic path.

## Parameters

### db

[`CreditsDB`](../type-aliases/CreditsDB.md)

### userId

`string`

### amount

`number`

### reason

`string`

## Returns

`Promise`\<`number`\>
