[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/credits](../README.md) / debitCredits

# Function: debitCredits()

> **debitCredits**(`db`, `userId`, `amount`, `reason`): `Promise`\<`number`\>

Defined in: [tooling/ts/packages/credits/src/credits.ts:238](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/credits/src/credits.ts#L238)

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
