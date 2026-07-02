[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / tableToV4Warnings

# Function: tableToV4Warnings()

> **tableToV4Warnings**(`table`): `object`

Defined in: [schemas.ts:61](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/drizzle/src/schemas.ts#L61)

Same conversion as [tableToV4](tableToV4.md) but also returns the enumerated lossy boundary (per-projection
zodToV4 warnings). Empty arrays ⇒ fully lossless. Callers wanting the honest-loss accounting use this.

## Parameters

### table

`Table`

## Returns

`object`

### schemas

> **schemas**: [`TableV4Schemas`](../interfaces/TableV4Schemas.md)

### warnings

> **warnings**: `object`

#### warnings.insert

> **insert**: `string`[]

#### warnings.select

> **select**: `string`[]

#### warnings.update

> **update**: `string`[]
