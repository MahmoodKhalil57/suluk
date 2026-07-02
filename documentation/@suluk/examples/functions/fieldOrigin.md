[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/examples](../README.md) / fieldOrigin

# Function: fieldOrigin()

> **fieldOrigin**(`schema`): [`FieldOrigin`](../type-aliases/FieldOrigin.md)

Defined in: [index.ts:80](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/examples/src/index.ts#L80)

Read a property's origin: explicit `x-suluk-origin` wins; else `readOnly` ⇒ `computed`; else default `input`.

## Parameters

### schema

[`JsonSchema`](../type-aliases/JsonSchema.md) \| `undefined`

## Returns

[`FieldOrigin`](../type-aliases/FieldOrigin.md)
