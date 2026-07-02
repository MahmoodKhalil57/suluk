[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/keys](../README.md) / subtreeOf

# Function: subtreeOf()

> **subtreeOf**(`db`, `keyId`): `Promise`\<`string`[]\>

Defined in: [packages/keys/src/lineage.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/keys/src/lineage.ts#L33)

The keyIds in a node's subtree (itself + every descendant) — for cascade revoke. Falls back to `[keyId]` for a
 legacy caller with no lineage row (a childless root).

## Parameters

### db

[`KeysDB`](../type-aliases/KeysDB.md)

### keyId

`string`

## Returns

`Promise`\<`string`[]\>
