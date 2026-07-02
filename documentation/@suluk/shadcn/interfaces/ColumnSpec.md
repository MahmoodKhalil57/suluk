[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/shadcn](../README.md) / ColumnSpec

# Interface: ColumnSpec

Defined in: [spec.ts:55](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/shadcn/src/spec.ts#L55)

One table column, derived from a single object property.

## Properties

### header

> **header**: `string`

Defined in: [spec.ts:59](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/shadcn/src/spec.ts#L59)

Column header (title if present, else the humanised key).

***

### key

> **key**: `string`

Defined in: [spec.ts:57](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/shadcn/src/spec.ts#L57)

Property name = row accessor key.

***

### type

> **type**: `string`

Defined in: [spec.ts:61](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/shadcn/src/spec.ts#L61)

The JSON Schema `type` of the property ("string"/"number"/… or "unknown").
