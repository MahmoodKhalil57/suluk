[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / assetHash

# Function: assetHash()

> **assetHash**(`bytes`): `Promise`\<`string`\>

Defined in: [tooling/ts/packages/cloudflare/src/assets.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cloudflare/src/assets.ts#L23)

The Workers-Assets manifest hash: the first 32 hex chars (16 bytes) of the contents' SHA-256. The API rejects
 the full 64-char digest ("file hash size of 64 is too large").

## Parameters

### bytes

`Uint8Array`

## Returns

`Promise`\<`string`\>
