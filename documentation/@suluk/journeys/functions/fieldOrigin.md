[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / fieldOrigin

# Function: fieldOrigin()

> **fieldOrigin**(`schema`): [`FieldOrigin`](../type-aliases/FieldOrigin.md)

Defined in: [examples/src/index.ts:80](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/examples/src/index.ts#L80)

Read a property's origin: explicit `x-suluk-origin` wins; else `readOnly` ⇒ `computed`; else default `input`.

## Parameters

### schema

[`JsonSchema`](../type-aliases/JsonSchema.md) \| `undefined`

## Returns

[`FieldOrigin`](../type-aliases/FieldOrigin.md)
