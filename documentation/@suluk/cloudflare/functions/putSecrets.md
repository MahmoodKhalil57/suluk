[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / putSecrets

# Function: putSecrets()

> **putSecrets**(`cf`, `scriptName`, `secrets`): `Promise`\<`string`[]\>

Defined in: [tooling/ts/packages/cloudflare/src/resources.ts:127](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/cloudflare/src/resources.ts#L127)

Set many secrets, skipping empty/undefined values; returns the names actually set.

## Parameters

### cf

[`CloudflareClient`](../classes/CloudflareClient.md)

### scriptName

`string`

### secrets

`Record`\<`string`, `string` \| `undefined`\>

## Returns

`Promise`\<`string`[]\>
