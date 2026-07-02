[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / putSecrets

# Function: putSecrets()

> **putSecrets**(`cf`, `scriptName`, `secrets`): `Promise`\<`string`[]\>

Defined in: [tooling/ts/packages/cloudflare/src/resources.ts:127](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/cloudflare/src/resources.ts#L127)

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
