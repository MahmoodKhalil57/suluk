[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/mcp](../README.md) / buildRequest

# Function: buildRequest()

> **buildRequest**(`op`, `args`, `origin`, `headers?`): `Request`

Defined in: [exec.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/mcp/src/exec.ts#L15)

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
