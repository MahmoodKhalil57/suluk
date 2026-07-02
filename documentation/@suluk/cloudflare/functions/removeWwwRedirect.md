[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / removeWwwRedirect

# Function: removeWwwRedirect()

> **removeWwwRedirect**(`cf`, `zoneId`, `apexHost`): `Promise`\<`void`\>

Defined in: [tooling/ts/packages/cloudflare/src/resources.ts:103](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/cloudflare/src/resources.ts#L103)

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
