[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/harden](../README.md) / hardenDocument

# Function: hardenDocument()

> **hardenDocument**\<`T`\>(`doc`, `opts?`): `T`

Defined in: [harden.ts:54](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/harden/src/harden.ts#L54)

Harden EVERY input schema in a built v4 document IN PLACE — request bodies + all parameter slots (incl. the route
 generator's path params, otherwise unbounded strings). Idempotent. The transform that makes assertGrade pass.

## Type Parameters

### T

`T` *extends* [`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

## Parameters

### doc

`T`

### opts?

[`HardenOptions`](../interfaces/HardenOptions.md) = `{}`

## Returns

`T`
