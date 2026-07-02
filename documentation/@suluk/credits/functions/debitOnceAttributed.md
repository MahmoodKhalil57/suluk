[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/credits](../README.md) / debitOnceAttributed

# Function: debitOnceAttributed()

> **debitOnceAttributed**(`db`, `userId`, `amount`, `reason`, `idemKey`, `keyId?`): `Promise`\<[`DebitOutcome`](../type-aliases/DebitOutcome.md)\>

Defined in: [tooling/ts/packages/credits/src/credits.ts:122](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/credits/src/credits.ts#L122)

Idempotent debit + per-key ATTRIBUTION — the money primitive a per-item bulk charge needs ([debitOnceIfCovers](debitOnceIfCovers.md)
itself does NOT attribute). On a FRESH `debited` it records the spend against `keyId` (the row id is the stable nonce);
a `replayed`/`insufficient` attributes nothing.

## Parameters

### db

[`CreditsDB`](../type-aliases/CreditsDB.md)

### userId

`string`

### amount

`number`

### reason

`string`

### idemKey

`string`

### keyId?

`string` \| `null`

## Returns

`Promise`\<[`DebitOutcome`](../type-aliases/DebitOutcome.md)\>
