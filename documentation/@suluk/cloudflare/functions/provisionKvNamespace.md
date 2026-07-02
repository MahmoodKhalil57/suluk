[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / provisionKvNamespace

# Function: provisionKvNamespace()

> **provisionKvNamespace**(`cf`, `title`): `Promise`\<[`KvNamespace`](../interfaces/KvNamespace.md)\>

Defined in: [tooling/ts/packages/cloudflare/src/resources.ts:151](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/cloudflare/src/resources.ts#L151)

Create-or-get a Workers KV namespace by title (e.g. a sessions or rate-limit store).

## Parameters

### cf

[`CloudflareClient`](../classes/CloudflareClient.md)

### title

`string`

## Returns

`Promise`\<[`KvNamespace`](../interfaces/KvNamespace.md)\>
