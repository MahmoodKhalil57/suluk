[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/shadcn](../README.md) / ColumnSpec

# Interface: ColumnSpec

Defined in: [spec.ts:55](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/shadcn/src/spec.ts#L55)

One table column, derived from a single object property.

## Properties

### header

> **header**: `string`

Defined in: [spec.ts:59](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/shadcn/src/spec.ts#L59)

Column header (title if present, else the humanised key).

***

### key

> **key**: `string`

Defined in: [spec.ts:57](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/shadcn/src/spec.ts#L57)

Property name = row accessor key.

***

### type

> **type**: `string`

Defined in: [spec.ts:61](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/shadcn/src/spec.ts#L61)

The JSON Schema `type` of the property ("string"/"number"/… or "unknown").
