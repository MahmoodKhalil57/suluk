[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / resolveZoneId

# Function: resolveZoneId()

> **resolveZoneId**(`cf`, `apexHost`): `Promise`\<`string`\>

Defined in: [tooling/ts/packages/cloudflare/src/resources.ts:66](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/cloudflare/src/resources.ts#L66)

Resolve a zone id from its apex host (e.g. `example.com`). Throws when the token can't see the zone.

## Parameters

### cf

[`CloudflareClient`](../classes/CloudflareClient.md)

### apexHost

`string`

## Returns

`Promise`\<`string`\>
