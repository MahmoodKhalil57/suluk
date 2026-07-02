[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / mcpConnectionKeyId

# Function: mcpConnectionKeyId()

> **mcpConnectionKeyId**(`userId`, `clientId`): `string`

Defined in: [principal.ts:46](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/better-auth/src/principal.ts#L46)

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
