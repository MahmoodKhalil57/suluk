[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/scalar](../README.md) / enrichV4Facets

# Function: enrichV4Facets()

> **enrichV4Facets**(`doc`): `void`

Defined in: [index.ts:167](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/scalar/src/index.ts#L167)

Mutate a v4 document: stamp the facet badges + detail on each REQUEST (the v4 by-name operation) and prepend the
 v4-contract intro — the same superpowers as the 3.1 path, but kept in v4 shape. The forked Scalar ingests this
 natively (projects requests→ops internally) and carries `x-badges` / `x-suluk-*` through, so cost + access render
 on each operation AND the version badge reads 4.0.0-candidate (no downgrade). Reuses the 3.1 badge helpers since a
 v4 request carries `x-suluk-cost` / `x-suluk-access` directly.

## Parameters

### doc

#### info?

`Record`\<`string`, `unknown`\>

#### paths?

`Record`\<`string`, \{ `requests?`: `Record`\<`string`, `Record`\<`string`, `unknown`\>\>; \}\>

## Returns

`void`
