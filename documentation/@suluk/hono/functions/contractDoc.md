[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/hono](../README.md) / contractDoc

# Function: contractDoc()

> **contractDoc**\<`T`\>(`routes`): `T`

Defined in: [tooling/ts/packages/hono/src/contract.ts:89](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/hono/src/contract.ts#L89)

Stricter, OPT-IN variant of [contract](contract.md): identical runtime behavior + literal inference, but every route must be
DOCUMENTED (a `summary` or `description`) or it fails to type-check at the contract site — lifting the doc-coverage
audit (`audit()`'s `missing-doc` finding) into the type system, so an undocumented operation is a red squiggle, not a
CI warning. `contract()` stays UNCHANGED (some callers author docs separately / exercise the advisory audit); adopt
`contractDoc` where you want documentation enforced as you type.

## Type Parameters

### T

`T` *extends* readonly [`DocumentedRoute`](../type-aliases/DocumentedRoute.md)[]

## Parameters

### routes

`T`

## Returns

`T`
