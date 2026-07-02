[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/shadcn](../README.md) / tableSpec

# Function: tableSpec()

> **tableSpec**(`schema`, `opts?`): [`TableSpec`](../interfaces/TableSpec.md)

Defined in: [spec.ts:236](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/shadcn/src/spec.ts#L236)

Build a [TableSpec](../interfaces/TableSpec.md). An array root uses its `items` object; an object root uses its own properties.
Each property becomes one [ColumnSpec](../interfaces/ColumnSpec.md). Non-derivable roots yield zero columns plus a warning.

## Parameters

### schema

[`SchemaOrRef`](../../core/type-aliases/SchemaOrRef.md)

### opts?

[`SpecOptions`](../interfaces/SpecOptions.md) = `{}`

## Returns

[`TableSpec`](../interfaces/TableSpec.md)
