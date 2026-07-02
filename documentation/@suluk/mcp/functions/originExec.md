[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/mcp](../README.md) / originExec

# Function: originExec()

> **originExec**(`c`, `op`, `args`): `Promise`\<`unknown`\>

Defined in: [exec.ts:51](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/mcp/src/exec.ts#L51)

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
