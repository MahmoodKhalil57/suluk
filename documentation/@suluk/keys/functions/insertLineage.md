[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/keys](../README.md) / insertLineage

# Function: insertLineage()

> **insertLineage**(`db`, `opts`): `Promise`\<`void`\>

Defined in: [packages/keys/src/lineage.ts:50](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/keys/src/lineage.ts#L50)

Record a freshly-minted child (or root, when parentKeyId is null) in the lineage tree. Idempotent on the keyId PK.

## Parameters

### db

[`KeysDB`](../type-aliases/KeysDB.md)

### opts

#### keyId

`string`

#### parentKeyId

`string` \| `null`

#### parentPath

`string` \| `null`

#### userId

`string`

## Returns

`Promise`\<`void`\>
