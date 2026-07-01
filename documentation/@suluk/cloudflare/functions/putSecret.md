[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / putSecret

# Function: putSecret()

> **putSecret**(`cf`, `scriptName`, `name`, `value`): `Promise`\<`void`\>

Defined in: [tooling/ts/packages/cloudflare/src/resources.ts:121](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/cloudflare/src/resources.ts#L121)

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
