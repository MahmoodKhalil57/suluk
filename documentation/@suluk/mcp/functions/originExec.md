[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/mcp](../README.md) / originExec

# Function: originExec()

> **originExec**(`c`, `op`, `args`): `Promise`\<`unknown`\>

Defined in: [exec.ts:51](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/mcp/src/exec.ts#L51)

Default executor — fetch the worker's own public origin. Read-only catalog ops need no auth; mutations (only
 exposed under `include:"all"`) ride the forwarded session. NOTE: on Cloudflare Workers prefer [appExec](appExec.md).

## Parameters

### c

`Context`

### op

[`McpOp`](../interfaces/McpOp.md)

### args

`Record`\<`string`, `unknown`\>

## Returns

`Promise`\<`unknown`\>
