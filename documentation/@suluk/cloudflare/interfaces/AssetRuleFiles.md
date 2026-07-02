[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / AssetRuleFiles

# Interface: AssetRuleFiles

Defined in: [tooling/ts/packages/cloudflare/src/assets.ts:37](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/cloudflare/src/assets.ts#L37)

The result of splitting Workers-Assets rule files out of an asset list.

## Properties

### \_headers?

> `optional` **\_headers?**: `string`

Defined in: [tooling/ts/packages/cloudflare/src/assets.ts:41](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/cloudflare/src/assets.ts#L41)

raw `_headers` file contents, if present — passed in the worker metadata's assets.config, NOT uploaded.

***

### \_redirects?

> `optional` **\_redirects?**: `string`

Defined in: [tooling/ts/packages/cloudflare/src/assets.ts:43](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/cloudflare/src/assets.ts#L43)

raw `_redirects` file contents, if present.

***

### assets

> **assets**: [`AssetFile`](AssetFile.md)[]

Defined in: [tooling/ts/packages/cloudflare/src/assets.ts:39](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/cloudflare/src/assets.ts#L39)

the remaining files to actually upload + serve.
