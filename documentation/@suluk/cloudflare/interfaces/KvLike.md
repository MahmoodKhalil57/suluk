[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / KvLike

# Interface: KvLike

Defined in: [tooling/ts/packages/cloudflare/src/ratelimit.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cloudflare/src/ratelimit.ts#L16)

The slice of the Workers KV API this needs (get/put with TTL).

## Methods

### get()

> **get**(`key`): `Promise`\<`string` \| `null`\>

Defined in: [tooling/ts/packages/cloudflare/src/ratelimit.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cloudflare/src/ratelimit.ts#L16)

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`string` \| `null`\>

***

### put()

> **put**(`key`, `value`, `opts?`): `Promise`\<`void`\>

Defined in: [tooling/ts/packages/cloudflare/src/ratelimit.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cloudflare/src/ratelimit.ts#L16)

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
