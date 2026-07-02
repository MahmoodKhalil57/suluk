[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/keys](../README.md) / subtreeOf

# Function: subtreeOf()

> **subtreeOf**(`db`, `keyId`): `Promise`\<`string`[]\>

Defined in: [packages/keys/src/lineage.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/keys/src/lineage.ts#L33)

The keyIds in a node's subtree (itself + every descendant) — for cascade revoke. Falls back to `[keyId]` for a
 legacy caller with no lineage row (a childless root).

## Parameters

### db

[`KeysDB`](../type-aliases/KeysDB.md)

### keyId

`string`

## Returns

`Promise`\<`string`[]\>
