[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / uploadAssets

# Function: uploadAssets()

> **uploadAssets**(`cf`, `scriptName`, `files`): `Promise`\<`string` \| `null`\>

Defined in: [tooling/ts/packages/cloudflare/src/assets.ts:68](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cloudflare/src/assets.ts#L68)

Upload a set of static assets; returns the completion JWT for the worker metadata, or `null` when there are none.
When every file is already cached server-side the session returns no buckets and its own jwt IS the completion token.

## Parameters

### cf

[`CloudflareClient`](../classes/CloudflareClient.md)

### scriptName

`string`

### files

[`AssetFile`](../interfaces/AssetFile.md)[]

## Returns

`Promise`\<`string` \| `null`\>
