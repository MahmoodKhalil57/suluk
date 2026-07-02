[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / provisionKvNamespace

# Function: provisionKvNamespace()

> **provisionKvNamespace**(`cf`, `title`): `Promise`\<[`KvNamespace`](../interfaces/KvNamespace.md)\>

Defined in: [tooling/ts/packages/cloudflare/src/resources.ts:103](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/cloudflare/src/resources.ts#L103)

Create-or-get a Workers KV namespace by title (e.g. a sessions or rate-limit store).

## Parameters

### cf

[`CloudflareClient`](../classes/CloudflareClient.md)

### title

`string`

## Returns

`Promise`\<[`KvNamespace`](../interfaces/KvNamespace.md)\>
