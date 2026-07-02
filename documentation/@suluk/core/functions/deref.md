[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / deref

# Function: deref()

> **deref**\<`T`\>(`doc`, `value`): `T`

Defined in: [reference.ts:38](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/core/src/reference.ts#L38)

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
