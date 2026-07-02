[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / removeWwwRedirect

# Function: removeWwwRedirect()

> **removeWwwRedirect**(`cf`, `zoneId`, `apexHost`): `Promise`\<`void`\>

Defined in: [tooling/ts/packages/cloudflare/src/resources.ts:103](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/cloudflare/src/resources.ts#L103)

Remove the suluk www→apex redirect rule from the zone (leaves any other redirect rules intact).

## Parameters

### cf

[`CloudflareClient`](../classes/CloudflareClient.md)

### zoneId

`string`

### apexHost

`string`

## Returns

`Promise`\<`void`\>
