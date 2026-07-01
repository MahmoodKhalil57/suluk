[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/credits](../README.md) / recordAmount

# Function: recordAmount()

> **recordAmount**(`db`, `txnId`, `amountCents`): `Promise`\<`void`\>

Defined in: [tooling/ts/packages/credits/src/credits.ts:152](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/credits/src/credits.ts#L152)

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
