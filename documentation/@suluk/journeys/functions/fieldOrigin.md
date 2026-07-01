[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / fieldOrigin

# Function: fieldOrigin()

> **fieldOrigin**(`schema`): [`FieldOrigin`](../type-aliases/FieldOrigin.md)

Defined in: [examples/src/index.ts:80](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/examples/src/index.ts#L80)

Read a property's origin: explicit `x-suluk-origin` wins; else `readOnly` ⇒ `computed`; else default `input`.

## Parameters

### schema

[`JsonSchema`](../type-aliases/JsonSchema.md) \| `undefined`

## Returns

[`FieldOrigin`](../type-aliases/FieldOrigin.md)
