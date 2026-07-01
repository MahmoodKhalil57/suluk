[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/scalar](../README.md) / enrichFacetBadges

# Function: enrichFacetBadges()

> **enrichFacetBadges**(`spec`): `void`

Defined in: [index.ts:83](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/scalar/src/index.ts#L83)

Mutate a downgraded 3.1 spec: attach Scalar `x-badges` derived from the carried-through v4 facets, so cost +
 access show up right on each operation in Scalar's UI (which has no native concept of them).

## Parameters

### spec

#### paths?

`Record`\<`string`, `Record`\<`string`, `unknown`\>\>

## Returns

`void`
