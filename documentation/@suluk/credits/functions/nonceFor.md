[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/credits](../README.md) / nonceFor

# Function: nonceFor()

> **nonceFor**(`reason`, `idemKey`): `string`

Defined in: [tooling/ts/packages/credits/src/credits.ts:90](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/credits/src/credits.ts#L90)

The DETERMINISTIC ledger row id an idempotent operation maps to — exported so a caller can pre-check existence at the
 SAME id [debitOnceIfCovers](debitOnceIfCovers.md) will use, without re-deriving the format and risking drift.

## Parameters

### reason

`string`

### idemKey

`string`

## Returns

`string`
