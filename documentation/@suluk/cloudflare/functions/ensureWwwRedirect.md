[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / ensureWwwRedirect

# Function: ensureWwwRedirect()

> **ensureWwwRedirect**(`cf`, `zoneId`, `apexHost`): `Promise`\<\{ `added`: `boolean`; \}\>

Defined in: [tooling/ts/packages/cloudflare/src/resources.ts:87](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/cloudflare/src/resources.ts#L87)

Ensure a www→apex 301 redirect (path + query preserved) on the zone. Idempotent (dedup by rule description).

## Parameters

### cf

[`CloudflareClient`](../classes/CloudflareClient.md)

### zoneId

`string`

### apexHost

`string`

## Returns

`Promise`\<\{ `added`: `boolean`; \}\>
