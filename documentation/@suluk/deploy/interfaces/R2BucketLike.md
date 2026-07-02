[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/deploy](../README.md) / R2BucketLike

# Interface: R2BucketLike

Defined in: [storage.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/deploy/src/storage.ts#L32)

The minimal Workers R2 surface this binding calls — satisfied by the real `R2Bucket` and by a mock.

## Methods

### delete()

> **delete**(`key`): `Promise`\<`void`\>

Defined in: [storage.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/deploy/src/storage.ts#L34)

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`void`\>

***

### put()

> **put**(`key`, `value`, `opts?`): `Promise`\<`unknown`\>

Defined in: [storage.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/deploy/src/storage.ts#L33)

#### Parameters

##### key

`string`

##### value

`string` \| `ArrayBuffer` \| `Uint8Array`\<`ArrayBufferLike`\>

##### opts?

###### httpMetadata?

\{ `contentType?`: `string`; \}

###### httpMetadata.contentType?

`string`

#### Returns

`Promise`\<`unknown`\>
