[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / isReference

# Function: isReference()

> **isReference**(`x`): `x is Reference`

Defined in: [reference.ts:5](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/core/src/reference.ts#L5)

Structural guard for an OpenAPI Reference Object (C019 §A.1). NOTE: a JSON Schema may also carry a
 `$ref` keyword; in Schema-Object position the slot+token rule (C019) decides — this is the structural test.

## Parameters

### x

`unknown`

## Returns

`x is Reference`
