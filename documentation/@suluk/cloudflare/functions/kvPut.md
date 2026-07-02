[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / kvPut

# Function: kvPut()

> **kvPut**(`cf`, `namespaceId`, `key`, `value`, `opts?`): `Promise`\<`void`\>

Defined in: [tooling/ts/packages/cloudflare/src/resources.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/cloudflare/src/resources.ts#L44)

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
