[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/keys](../README.md) / parentPathOf

# Function: parentPathOf()

> **parentPathOf**(`db`, `parentKeyId`): `Promise`\<`string` \| `null`\>

Defined in: [packages/keys/src/lineage.ts:43](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/keys/src/lineage.ts#L43)

A parent's materialized path (for building a child's path). A parent with no row is a root → its bare id; a null
 parent (a session/account caller) → null (the child is a root).

## Parameters

### db

[`KeysDB`](../type-aliases/KeysDB.md)

### parentKeyId

`string` \| `null`

## Returns

`Promise`\<`string` \| `null`\>
