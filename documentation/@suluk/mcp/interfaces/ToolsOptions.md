[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/mcp](../README.md) / ToolsOptions

# Interface: ToolsOptions

Defined in: [tools.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/mcp/src/tools.ts#L32)

`@suluk/mcp` — project ONE OpenAPI v4 document into a Model Context Protocol server. The same contract that drives
the API, SDK, docs, admin, and panel now drives an agent-callable surface: every operation becomes an MCP tool
(read-only by default; mutations opt-in via `include:"all"`), served over the Streamable-HTTP JSON-RPC transport
as a Hono-mountable app. No hand-written tool schemas, no config drift — the contract is the single source.
Pure projection (`toolsFrom`) + pure protocol (`handleRpc`) are independently testable; `mcpApp` wires transport.
CANDIDATE tooling — NOT official OAS.

## Extended by

- [`McpOptions`](McpOptions.md)

## Properties

### hide?

> `optional` **hide?**: `string`[]

Defined in: [tools.ts:36](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/mcp/src/tools.ts#L36)

Operation names to omit.

***

### include?

> `optional` **include?**: `"read"` \| `"all"`

Defined in: [tools.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/mcp/src/tools.ts#L34)

`"read"` (default) exposes only GET/HEAD operations; `"all"` also exposes mutations.

***

### includeDeprecated?

> `optional` **includeDeprecated?**: `boolean`

Defined in: [tools.ts:40](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/mcp/src/tools.ts#L40)

Include `deprecated` operations (default: skip them).

***

### only?

> `optional` **only?**: `string`[]

Defined in: [tools.ts:38](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/mcp/src/tools.ts#L38)

If set, expose ONLY these operation names (after hide).
