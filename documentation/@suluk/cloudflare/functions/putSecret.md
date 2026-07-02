[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / putSecret

# Function: putSecret()

> **putSecret**(`cf`, `scriptName`, `name`, `value`): `Promise`\<`void`\>

Defined in: [tooling/ts/packages/cloudflare/src/resources.ts:169](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/cloudflare/src/resources.ts#L169)

Set ONE Worker secret (an encrypted `secret_text` binding). The script must already exist.

## Parameters

### cf

[`CloudflareClient`](../classes/CloudflareClient.md)

### scriptName

`string`

### name

`string`

### value

`string`

## Returns

`Promise`\<`void`\>
