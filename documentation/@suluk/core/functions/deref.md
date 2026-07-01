[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / deref

# Function: deref()

> **deref**\<`T`\>(`doc`, `value`): `T`

Defined in: [reference.ts:38](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/core/src/reference.ts#L38)

Resolve a value that may itself be a Reference (one hop). Returns the value unchanged if it is not a Reference.

## Type Parameters

### T

`T` = `unknown`

## Parameters

### doc

[`OpenAPIv4Document`](../interfaces/OpenAPIv4Document.md)

### value

[`Reference`](../interfaces/Reference.md) \| `T`

## Returns

`T`
