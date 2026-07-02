[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/mcp](../README.md) / McpTool

# Interface: McpTool

Defined in: [tools.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/mcp/src/tools.ts#L25)

`@suluk/mcp` — project ONE OpenAPI v4 document into a Model Context Protocol server. The same contract that drives
the API, SDK, docs, admin, and panel now drives an agent-callable surface: every operation becomes an MCP tool
(read-only by default; mutations opt-in via `include:"all"`), served over the Streamable-HTTP JSON-RPC transport
as a Hono-mountable app. No hand-written tool schemas, no config drift — the contract is the single source.
Pure projection (`toolsFrom`) + pure protocol (`handleRpc`) are independently testable; `mcpApp` wires transport.
CANDIDATE tooling — NOT official OAS.

## Properties

### description

> **description**: `string`

Defined in: [tools.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/mcp/src/tools.ts#L27)

***

### inputSchema

> **inputSchema**: `object`

Defined in: [tools.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/mcp/src/tools.ts#L28)

#### additionalProperties

> **additionalProperties**: `boolean`

#### properties

> **properties**: `Record`\<`string`, `unknown`\>

#### required?

> `optional` **required?**: `string`[]

#### type

> **type**: `"object"`

***

### name

> **name**: `string`

Defined in: [tools.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/mcp/src/tools.ts#L26)

***

### op

> **op**: [`McpOp`](McpOp.md)

Defined in: [tools.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/mcp/src/tools.ts#L29)
