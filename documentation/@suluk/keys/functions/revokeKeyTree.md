[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/keys](../README.md) / revokeKeyTree

# Function: revokeKeyTree()

> **revokeKeyTree**(`db`, `opts`, `disableKeys`): `Promise`\<\{ `revoked`: `number`; \}\>

Defined in: [packages/keys/src/lineage.ts:80](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/keys/src/lineage.ts#L80)

Cascade-revoke a key's subtree: compute the api-key ids in `keyId`'s subtree (a keyed caller may revoke ONLY a STRICT
descendant of itself — not itself, an ancestor, or another branch) and soft-disable them via the injected `disableKeys`
(the app's apikey update — so @suluk/keys stays free of the Better Auth apikey table). MCP ids are skipped (a
connection is revoked elsewhere). Returns the count disabled.

## Parameters

### db

[`KeysDB`](../type-aliases/KeysDB.md)

### opts

#### callerKeyId?

`string`

#### keyId

`string`

#### userId

`string`

### disableKeys

(`userId`, `keyIds`) => `Promise`\<`number`\>

## Returns

`Promise`\<\{ `revoked`: `number`; \}\>
