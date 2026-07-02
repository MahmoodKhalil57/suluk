[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / tableToV4Warnings

# Function: tableToV4Warnings()

> **tableToV4Warnings**(`table`): `object`

Defined in: [schemas.ts:61](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/drizzle/src/schemas.ts#L61)

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
