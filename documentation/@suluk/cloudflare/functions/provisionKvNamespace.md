[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / provisionKvNamespace

# Function: provisionKvNamespace()

> **provisionKvNamespace**(`cf`, `title`): `Promise`\<[`KvNamespace`](../interfaces/KvNamespace.md)\>

Defined in: [tooling/ts/packages/cloudflare/src/resources.ts:151](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cloudflare/src/resources.ts#L151)

Create-or-get a Workers KV namespace by title (e.g. a sessions or rate-limit store).

## Parameters

### cf

[`CloudflareClient`](../classes/CloudflareClient.md)

### title

`string`

## Returns

`Promise`\<[`KvNamespace`](../interfaces/KvNamespace.md)\>
