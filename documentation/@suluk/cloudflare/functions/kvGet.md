[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / kvGet

# Function: kvGet()

> **kvGet**(`cf`, `namespaceId`, `key`): `Promise`\<`string` \| `null`\>

Defined in: [tooling/ts/packages/cloudflare/src/resources.ts:38](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/cloudflare/src/resources.ts#L38)

Read a KV value (raw); null when the key is absent.

## Parameters

### cf

[`CloudflareClient`](../classes/CloudflareClient.md)

### namespaceId

`string`

### key

`string`

## Returns

`Promise`\<`string` \| `null`\>
