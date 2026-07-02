[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / KvLike

# Interface: KvLike

Defined in: [tooling/ts/packages/cloudflare/src/ratelimit.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/cloudflare/src/ratelimit.ts#L16)

The slice of the Workers KV API this needs (get/put with TTL).

## Methods

### get()

> **get**(`key`): `Promise`\<`string` \| `null`\>

Defined in: [tooling/ts/packages/cloudflare/src/ratelimit.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/cloudflare/src/ratelimit.ts#L16)

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`string` \| `null`\>

***

### put()

> **put**(`key`, `value`, `opts?`): `Promise`\<`void`\>

Defined in: [tooling/ts/packages/cloudflare/src/ratelimit.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/cloudflare/src/ratelimit.ts#L16)

#### Parameters

##### key

`string`

##### value

`string`

##### opts?

###### expirationTtl?

`number`

#### Returns

`Promise`\<`void`\>
