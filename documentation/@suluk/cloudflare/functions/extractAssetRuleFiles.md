[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / extractAssetRuleFiles

# Function: extractAssetRuleFiles()

> **extractAssetRuleFiles**(`files`): [`AssetRuleFiles`](../interfaces/AssetRuleFiles.md)

Defined in: [tooling/ts/packages/cloudflare/src/assets.ts:53](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/cloudflare/src/assets.ts#L53)

Pull `_headers` / `_redirects` OUT of an asset list. Cloudflare Workers Static Assets does NOT serve these as files
— it parses their raw text (sent in the worker metadata's `assets.config._headers` / `._redirects`) into the
header/redirect rules the asset runtime applies. So they must be EXCLUDED from the upload manifest (else they'd
serve as public 200 blobs and the rules would never activate) and their contents routed to the config instead.
This mirrors exactly what wrangler does (excludes the two files, forwards their contents in the config).

## Parameters

### files

[`AssetFile`](../interfaces/AssetFile.md)[]

## Returns

[`AssetRuleFiles`](../interfaces/AssetRuleFiles.md)
