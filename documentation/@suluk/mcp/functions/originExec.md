[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/mcp](../README.md) / originExec

# Function: originExec()

> **originExec**(`c`, `op`, `args`): `Promise`\<`unknown`\>

Defined in: [exec.ts:51](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/mcp/src/exec.ts#L51)

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
