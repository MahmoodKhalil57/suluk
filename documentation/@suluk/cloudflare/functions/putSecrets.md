[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / putSecrets

# Function: putSecrets()

> **putSecrets**(`cf`, `scriptName`, `secrets`): `Promise`\<`string`[]\>

Defined in: [tooling/ts/packages/cloudflare/src/resources.ts:175](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cloudflare/src/resources.ts#L175)

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
