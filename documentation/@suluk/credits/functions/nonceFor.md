[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/credits](../README.md) / nonceFor

# Function: nonceFor()

> **nonceFor**(`reason`, `idemKey`): `string`

Defined in: [tooling/ts/packages/credits/src/credits.ts:90](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/credits/src/credits.ts#L90)

The DETERMINISTIC ledger row id an idempotent operation maps to — exported so a caller can pre-check existence at the
 SAME id [debitOnceIfCovers](debitOnceIfCovers.md) will use, without re-deriving the format and risking drift.

## Parameters

### reason

`string`

### idemKey

`string`

## Returns

`string`
