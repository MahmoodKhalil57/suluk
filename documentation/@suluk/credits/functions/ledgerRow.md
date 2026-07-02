[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/credits](../README.md) / ledgerRow

# Function: ledgerRow()

> **ledgerRow**(`db`, `id`): `Promise`\<\{ `amountCents`: `number` \| `null`; `delta`: `number`; \} \| `null`\>

Defined in: [tooling/ts/packages/credits/src/credits.ts:130](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/credits/src/credits.ts#L130)

The signed credit `delta` + recorded `amountCents` for ONE ledger row id, or null if absent. Lets an idempotent replay
 report the ORIGINAL operation's amounts — never the retry's (possibly tampered) request.

## Parameters

### db

[`CreditsDB`](../type-aliases/CreditsDB.md)

### id

`string`

## Returns

`Promise`\<\{ `amountCents`: `number` \| `null`; `delta`: `number`; \} \| `null`\>
