[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / isReference

# Function: isReference()

> **isReference**(`x`): `x is Reference`

Defined in: [reference.ts:5](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/reference.ts#L5)

Structural guard for an OpenAPI Reference Object (C019 §A.1). NOTE: a JSON Schema may also carry a
 `$ref` keyword; in Schema-Object position the slot+token rule (C019) decides — this is the structural test.

## Parameters

### x

`unknown`

## Returns

`x is Reference`
