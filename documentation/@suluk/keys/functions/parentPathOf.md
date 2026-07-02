[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/keys](../README.md) / parentPathOf

# Function: parentPathOf()

> **parentPathOf**(`db`, `parentKeyId`): `Promise`\<`string` \| `null`\>

Defined in: [packages/keys/src/lineage.ts:43](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/keys/src/lineage.ts#L43)

A parent's materialized path (for building a child's path). A parent with no row is a root → its bare id; a null
 parent (a session/account caller) → null (the child is a root).

## Parameters

### db

[`KeysDB`](../type-aliases/KeysDB.md)

### parentKeyId

`string` \| `null`

## Returns

`Promise`\<`string` \| `null`\>
