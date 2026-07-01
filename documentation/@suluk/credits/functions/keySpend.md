[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/credits](../README.md) / keySpend

# Function: keySpend()

> **keySpend**(`db`, `keyId`): `Promise`\<`number`\>

Defined in: [tooling/ts/packages/credits/src/credits.ts:76](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/credits/src/credits.ts#L76)

Total credits a key has spent — SUM(abs(delta)) over its attributed DEBITS (delta < 0). Drives the per-key cap + the
 keys-page usage column.

## Parameters

### db

[`CreditsDB`](../type-aliases/CreditsDB.md)

### keyId

`string`

## Returns

`Promise`\<`number`\>
