[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/scalar](../README.md) / enrichFacetBadges

# Function: enrichFacetBadges()

> **enrichFacetBadges**(`spec`): `void`

Defined in: [index.ts:83](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/scalar/src/index.ts#L83)

Mutate a downgraded 3.1 spec: attach Scalar `x-badges` derived from the carried-through v4 facets, so cost +
 access show up right on each operation in Scalar's UI (which has no native concept of them).

## Parameters

### spec

#### paths?

`Record`\<`string`, `Record`\<`string`, `unknown`\>\>

## Returns

`void`
