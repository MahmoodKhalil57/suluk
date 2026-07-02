[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/credits](../README.md) / keySpend

# Function: keySpend()

> **keySpend**(`db`, `keyId`): `Promise`\<`number`\>

Defined in: [tooling/ts/packages/credits/src/credits.ts:76](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/credits/src/credits.ts#L76)

Total credits a key has spent — SUM(abs(delta)) over its attributed DEBITS (delta < 0). Drives the per-key cap + the
 keys-page usage column.

## Parameters

### db

[`CreditsDB`](../type-aliases/CreditsDB.md)

### keyId

`string`

## Returns

`Promise`\<`number`\>
