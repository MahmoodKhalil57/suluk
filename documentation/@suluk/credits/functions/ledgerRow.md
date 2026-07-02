[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/credits](../README.md) / ledgerRow

# Function: ledgerRow()

> **ledgerRow**(`db`, `id`): `Promise`\<\{ `amountCents`: `number` \| `null`; `delta`: `number`; \} \| `null`\>

Defined in: [tooling/ts/packages/credits/src/credits.ts:130](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/credits/src/credits.ts#L130)

The signed credit `delta` + recorded `amountCents` for ONE ledger row id, or null if absent. Lets an idempotent replay
 report the ORIGINAL operation's amounts — never the retry's (possibly tampered) request.

## Parameters

### db

[`CreditsDB`](../type-aliases/CreditsDB.md)

### id

`string`

## Returns

`Promise`\<\{ `amountCents`: `number` \| `null`; `delta`: `number`; \} \| `null`\>
