# Types & Enums

## tools

### `McpTool`
`@suluk/mcp` — project ONE OpenAPI v4 document into a Model Context Protocol server. The same contract that drives
the API, SDK, docs, admin, and panel now drives an agent-callable surface: every operation becomes an MCP tool
(read-only by default; mutations opt-in via `include:"all"`), served over the Streamable-HTTP JSON-RPC transport
as a Hono-mountable app. No hand-written tool schemas, no config drift — the contract is the single source.
Pure projection (`toolsFrom`) + pure protocol (`handleRpc`) are independently testable; `mcpApp` wires transport.
CANDIDATE tooling — NOT official OAS.
**Properties:**
- `name: string`
- `description: string`
- `inputSchema: { type: "object"; properties: Record<string, unknown>; required?: string[]; additionalProperties: boolean }`
- `op: McpOp`

### `McpOp`
`@suluk/mcp` — project ONE OpenAPI v4 document into a Model Context Protocol server. The same contract that drives
the API, SDK, docs, admin, and panel now drives an agent-callable surface: every operation becomes an MCP tool
(read-only by default; mutations opt-in via `include:"all"`), served over the Streamable-HTTP JSON-RPC transport
as a Hono-mountable app. No hand-written tool schemas, no config drift — the contract is the single source.
Pure projection (`toolsFrom`) + pure protocol (`handleRpc`) are independently testable; `mcpApp` wires transport.
CANDIDATE tooling — NOT official OAS.
**Properties:**
- `name: string` — Tool name (sanitized to MCP rules) — also how the executor finds the operation.
- `method: string`
- `path: string` — Path template with a leading slash, e.g. `/product/{id}`.
- `pathParams: string[]` — Path-template variable names, in template order — all required.
- `queryParams: string[]` — Query parameter names.
- `hasBody: boolean` — Whether this op carries a request body (the tool exposes it under `body`).
- `readOnly: boolean` — GET/HEAD — safe, side-effect-free. The default projection only exposes these.

## protocol

### `RpcRequest`
**Properties:**
- `jsonrpc: string` (optional)
- `id: string | number | null` (optional)
- `method: string` (optional)
- `params: Record<string, unknown>` (optional)

### `RpcResponse`
**Properties:**
- `jsonrpc: "2.0"`
- `id: string | number | null`
- `result: unknown` (optional)
- `error: { code: number; message: string; data?: unknown }` (optional)

### `RpcContext`
**Properties:**
- `tools: McpTool[]`
- `info: { name: string; version: string }`
- `exec: ToolExec`
- `protocolVersion: string` (optional) — Server's preferred protocol version (echoed back only if the client didn't pin a supported one).
- `instructions: string` (optional) — Optional free-text usage guidance surfaced to the model on `initialize`.
- `resident: Set<string>` (optional) — TIER-TRIM (C027 tier-trim serving) — the names of the RESIDENT tools. When set, `tools/list` serves only those
plus a synthetic `discover_tools` meta-tool; the COLD-TAIL (every other tool) is withheld from the default
surface and revealed on demand when the model calls `discover_tools`. `tools/call` still executes ANY tool by
name (cold-tail tools are servable, just not advertised up front) — so the context reduction is real, lossless,
and self-healing. Absent ⇒ the full surface is served (no trim).

### `ToolExec`
```ts
(op: McpOp, args: Record<string, unknown>) => Promise<unknown>
```

## exec

### `FetchApp`
