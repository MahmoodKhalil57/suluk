[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/mcp](../README.md) / toolsFrom

# Function: toolsFrom()

> **toolsFrom**(`doc`, `opts?`): [`McpTool`](../interfaces/McpTool.md)[]

Defined in: [tools.ts:78](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/mcp/src/tools.ts#L78)

`@suluk/mcp` — project ONE OpenAPI v4 document into a Model Context Protocol server. The same contract that drives
the API, SDK, docs, admin, and panel now drives an agent-callable surface: every operation becomes an MCP tool
(read-only by default; mutations opt-in via `include:"all"`), served over the Streamable-HTTP JSON-RPC transport
as a Hono-mountable app. No hand-written tool schemas, no config drift — the contract is the single source.
Pure projection (`toolsFrom`) + pure protocol (`handleRpc`) are independently testable; `mcpApp` wires transport.
CANDIDATE tooling — NOT official OAS.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### opts?

[`ToolsOptions`](../interfaces/ToolsOptions.md) = `{}`

## Returns

[`McpTool`](../interfaces/McpTool.md)[]
