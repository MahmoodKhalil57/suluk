[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / removeWwwRedirect

# Function: removeWwwRedirect()

> **removeWwwRedirect**(`cf`, `zoneId`, `apexHost`): `Promise`\<`void`\>

Defined in: [tooling/ts/packages/cloudflare/src/resources.ts:103](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cloudflare/src/resources.ts#L103)

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
