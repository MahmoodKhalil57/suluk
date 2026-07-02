[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / assetHash

# Function: assetHash()

> **assetHash**(`bytes`): `Promise`\<`string`\>

Defined in: [tooling/ts/packages/cloudflare/src/assets.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/cloudflare/src/assets.ts#L23)

The Workers-Assets manifest hash: the first 32 hex chars (16 bytes) of the contents' SHA-256. The API rejects
 the full 64-char digest ("file hash size of 64 is too large").

## Parameters

### bytes

`Uint8Array`

## Returns

`Promise`\<`string`\>
