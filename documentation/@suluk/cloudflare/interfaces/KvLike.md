[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / KvLike

# Interface: KvLike

Defined in: [tooling/ts/packages/cloudflare/src/ratelimit.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/cloudflare/src/ratelimit.ts#L16)

The slice of the Workers KV API this needs (get/put with TTL).

## Methods

### get()

> **get**(`key`): `Promise`\<`string` \| `null`\>

Defined in: [tooling/ts/packages/cloudflare/src/ratelimit.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/cloudflare/src/ratelimit.ts#L16)

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`string` \| `null`\>

***

### put()

> **put**(`key`, `value`, `opts?`): `Promise`\<`void`\>

Defined in: [tooling/ts/packages/cloudflare/src/ratelimit.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/cloudflare/src/ratelimit.ts#L16)

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
