[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / kvGet

# Function: kvGet()

> **kvGet**(`cf`, `namespaceId`, `key`): `Promise`\<`string` \| `null`\>

Defined in: [tooling/ts/packages/cloudflare/src/resources.ts:38](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/cloudflare/src/resources.ts#L38)

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
