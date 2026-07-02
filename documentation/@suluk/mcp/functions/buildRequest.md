[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/mcp](../README.md) / buildRequest

# Function: buildRequest()

> **buildRequest**(`op`, `args`, `origin`, `headers?`): `Request`

Defined in: [exec.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/mcp/src/exec.ts#L15)

Build the same-origin Request for an operation call. `origin` is trusted; `args` values are caller-supplied.

## Parameters

### op

[`McpOp`](../interfaces/McpOp.md)

### args

`Record`\<`string`, `unknown`\>

### origin

`string`

### headers?

`Record`\<`string`, `string`\> = `{}`

## Returns

`Request`
