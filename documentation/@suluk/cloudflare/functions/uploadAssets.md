[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / uploadAssets

# Function: uploadAssets()

> **uploadAssets**(`cf`, `scriptName`, `files`): `Promise`\<`string` \| `null`\>

Defined in: [tooling/ts/packages/cloudflare/src/assets.ts:68](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/cloudflare/src/assets.ts#L68)

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
