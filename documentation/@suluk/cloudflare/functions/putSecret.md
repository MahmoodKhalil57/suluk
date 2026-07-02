[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / putSecret

# Function: putSecret()

> **putSecret**(`cf`, `scriptName`, `name`, `value`): `Promise`\<`void`\>

Defined in: [tooling/ts/packages/cloudflare/src/resources.ts:169](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/cloudflare/src/resources.ts#L169)

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
