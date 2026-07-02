[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/chat](../README.md) / sanitizeClientTools

# Function: sanitizeClientTools()

> **sanitizeClientTools**(`input`, `serverNames`): [`ClientToolDef`](../interfaces/ClientToolDef.md)[]

Defined in: [chat/src/app.ts:87](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/chat/src/app.ts#L87)

Validate client-declared browser tools: well-formed names only, capped, and NEVER allowed to shadow a server
 tool (a forged client tool with a server tool's name would otherwise hijack a privileged op into the browser).

## Parameters

### input

`unknown`

### serverNames

`Set`\<`string`\>

## Returns

[`ClientToolDef`](../interfaces/ClientToolDef.md)[]
