[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / mcpConnectionKeyId

# Function: mcpConnectionKeyId()

> **mcpConnectionKeyId**(`userId`, `clientId`): `string`

Defined in: [principal.ts:36](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/better-auth/src/principal.ts#L36)

The attributed-spend identity of an MCP bearer caller — `mcp:<userId>:<clientId>`. The SINGLE source shared by auth's
 `mcpBearerAuth` (which stamps it as the request `keyId`) and the `mcp` connection store, so they never drift + so `mcp`
 needs no `../auth` import.

## Parameters

### userId

`string`

### clientId

`string`

## Returns

`string`
