[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / kvPut

# Function: kvPut()

> **kvPut**(`cf`, `namespaceId`, `key`, `value`, `opts?`): `Promise`\<`void`\>

Defined in: [tooling/ts/packages/cloudflare/src/resources.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/cloudflare/src/resources.ts#L44)

Write a KV value (optional TTL in seconds).

## Parameters

### cf

[`CloudflareClient`](../classes/CloudflareClient.md)

### namespaceId

`string`

### key

`string`

### value

`string`

### opts?

#### expirationTtl?

`number`

## Returns

`Promise`\<`void`\>
