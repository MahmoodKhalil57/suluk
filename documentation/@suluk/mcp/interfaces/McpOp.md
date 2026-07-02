[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/mcp](../README.md) / McpOp

# Interface: McpOp

Defined in: [tools.ts:9](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/mcp/src/tools.ts#L9)

`@suluk/mcp` — project ONE OpenAPI v4 document into a Model Context Protocol server. The same contract that drives
the API, SDK, docs, admin, and panel now drives an agent-callable surface: every operation becomes an MCP tool
(read-only by default; mutations opt-in via `include:"all"`), served over the Streamable-HTTP JSON-RPC transport
as a Hono-mountable app. No hand-written tool schemas, no config drift — the contract is the single source.
Pure projection (`toolsFrom`) + pure protocol (`handleRpc`) are independently testable; `mcpApp` wires transport.
CANDIDATE tooling — NOT official OAS.

## Properties

### hasBody

> **hasBody**: `boolean`

Defined in: [tools.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/mcp/src/tools.ts#L20)

Whether this op carries a request body (the tool exposes it under `body`).

***

### method

> **method**: `string`

Defined in: [tools.ts:12](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/mcp/src/tools.ts#L12)

***

### name

> **name**: `string`

Defined in: [tools.ts:11](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/mcp/src/tools.ts#L11)

Tool name (sanitized to MCP rules) — also how the executor finds the operation.

***

### path

> **path**: `string`

Defined in: [tools.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/mcp/src/tools.ts#L14)

Path template with a leading slash, e.g. `/product/{id}`.

***

### pathParams

> **pathParams**: `string`[]

Defined in: [tools.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/mcp/src/tools.ts#L16)

Path-template variable names, in template order — all required.

***

### queryParams

> **queryParams**: `string`[]

Defined in: [tools.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/mcp/src/tools.ts#L18)

Query parameter names.

***

### readOnly

> **readOnly**: `boolean`

Defined in: [tools.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/mcp/src/tools.ts#L22)

GET/HEAD — safe, side-effect-free. The default projection only exposes these.
