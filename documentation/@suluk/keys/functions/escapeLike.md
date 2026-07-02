[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/keys](../README.md) / escapeLike

# Function: escapeLike()

> **escapeLike**(`s`): `string`

Defined in: [packages/keys/src/path.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/keys/src/path.ts#L13)

Escape SQL-LIKE metacharacters (a keyId can contain `_`, a LIKE wildcard) so a path prefix matches LITERALLY — pair
 with `ESCAPE '\'` in the query. Without this, a sibling whose id shares a `_`-adjacent prefix could leak into a
 subtree match.

## Parameters

### s

`string`

## Returns

`string`
