[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / assetHash

# Function: assetHash()

> **assetHash**(`bytes`): `Promise`\<`string`\>

Defined in: [tooling/ts/packages/cloudflare/src/assets.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/cloudflare/src/assets.ts#L23)

The Workers-Assets manifest hash: the first 32 hex chars (16 bytes) of the contents' SHA-256. The API rejects
 the full 64-char digest ("file hash size of 64 is too large").

## Parameters

### bytes

`Uint8Array`

## Returns

`Promise`\<`string`\>
