[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/credits](../README.md) / nonceFor

# Function: nonceFor()

> **nonceFor**(`reason`, `idemKey`): `string`

Defined in: [tooling/ts/packages/credits/src/credits.ts:90](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/credits/src/credits.ts#L90)

The DETERMINISTIC ledger row id an idempotent operation maps to — exported so a caller can pre-check existence at the
 SAME id [debitOnceIfCovers](debitOnceIfCovers.md) will use, without re-deriving the format and risking drift.

## Parameters

### reason

`string`

### idemKey

`string`

## Returns

`string`
