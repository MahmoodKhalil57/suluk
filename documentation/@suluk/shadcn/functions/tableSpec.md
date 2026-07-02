[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/shadcn](../README.md) / tableSpec

# Function: tableSpec()

> **tableSpec**(`schema`, `opts?`): [`TableSpec`](../interfaces/TableSpec.md)

Defined in: [spec.ts:236](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/shadcn/src/spec.ts#L236)

Build a [TableSpec](../interfaces/TableSpec.md). An array root uses its `items` object; an object root uses its own properties.
Each property becomes one [ColumnSpec](../interfaces/ColumnSpec.md). Non-derivable roots yield zero columns plus a warning.

## Parameters

### schema

[`SchemaOrRef`](../../core/type-aliases/SchemaOrRef.md)

### opts?

[`SpecOptions`](../interfaces/SpecOptions.md) = `{}`

## Returns

[`TableSpec`](../interfaces/TableSpec.md)
