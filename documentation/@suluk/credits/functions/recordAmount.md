[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/credits](../README.md) / recordAmount

# Function: recordAmount()

> **recordAmount**(`db`, `txnId`, `amountCents`): `Promise`\<`void`\>

Defined in: [tooling/ts/packages/credits/src/credits.ts:152](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/credits/src/credits.ts#L152)

Annotate a ledger row with the CASH that moved (signed). Idempotent (PK on txnId), best-effort (purely cosmetic). No-op on 0/null.

## Parameters

### db

[`CreditsDB`](../type-aliases/CreditsDB.md)

### txnId

`string`

### amountCents

`number` \| `null` \| `undefined`

## Returns

`Promise`\<`void`\>
