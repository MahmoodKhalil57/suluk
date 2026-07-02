[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/keys](../README.md) / subtreeOf

# Function: subtreeOf()

> **subtreeOf**(`db`, `keyId`): `Promise`\<`string`[]\>

Defined in: [packages/keys/src/lineage.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/keys/src/lineage.ts#L33)

The keyIds in a node's subtree (itself + every descendant) — for cascade revoke. Falls back to `[keyId]` for a
 legacy caller with no lineage row (a childless root).

## Parameters

### db

[`KeysDB`](../type-aliases/KeysDB.md)

### keyId

`string`

## Returns

`Promise`\<`string`[]\>
