[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/deploy](../README.md) / StorageProvider

# Interface: StorageProvider

Defined in: [storage.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/deploy/src/storage.ts#L20)

The swappable storage binding (the builder `storage` slot). Other providers (S3/GCS) implement the same shape.

## Properties

### id

> `readonly` **id**: `string`

Defined in: [storage.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/deploy/src/storage.ts#L22)

a stable id (matches the @suluk/builder storage-slot impl id, e.g. "r2").

## Methods

### delete()

> **delete**(`key`): `Promise`\<`void`\>

Defined in: [storage.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/deploy/src/storage.ts#L28)

remove an object — the GDPR erasure target for a user's media.

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`void`\>

***

### put()

> **put**(`key`, `body`, `opts?`): `Promise`\<[`StoredObject`](StoredObject.md)\>

Defined in: [storage.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/deploy/src/storage.ts#L24)

store bytes server-side; returns the key + its public URL.

#### Parameters

##### key

`string`

##### body

`string` \| `ArrayBuffer` \| `Uint8Array`\<`ArrayBufferLike`\>

##### opts?

###### contentType?

`string`

#### Returns

`Promise`\<[`StoredObject`](StoredObject.md)\>

***

### urlFor()

> **urlFor**(`key`): `string`

Defined in: [storage.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/deploy/src/storage.ts#L26)

the public/served URL for a key (no I/O).

#### Parameters

##### key

`string`

#### Returns

`string`
