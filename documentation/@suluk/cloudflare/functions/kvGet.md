[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / kvGet

# Function: kvGet()

> **kvGet**(`cf`, `namespaceId`, `key`): `Promise`\<`string` \| `null`\>

Defined in: [tooling/ts/packages/cloudflare/src/resources.ts:38](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/cloudflare/src/resources.ts#L38)

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
