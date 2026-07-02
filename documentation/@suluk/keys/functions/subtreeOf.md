[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/keys](../README.md) / subtreeOf

# Function: subtreeOf()

> **subtreeOf**(`db`, `keyId`): `Promise`\<`string`[]\>

Defined in: [packages/keys/src/lineage.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/keys/src/lineage.ts#L33)

The keyIds in a node's subtree (itself + every descendant) — for cascade revoke. Falls back to `[keyId]` for a
 legacy caller with no lineage row (a childless root).

## Parameters

### db

[`KeysDB`](../type-aliases/KeysDB.md)

### keyId

`string`

## Returns

`Promise`\<`string`[]\>
