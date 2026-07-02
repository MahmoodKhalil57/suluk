# Functions

## tools

### `toolsFrom`
`@suluk/mcp` — project ONE OpenAPI v4 document into a Model Context Protocol server. The same contract that drives
the API, SDK, docs, admin, and panel now drives an agent-callable surface: every operation becomes an MCP tool
(read-only by default; mutations opt-in via `include:"all"`), served over the Streamable-HTTP JSON-RPC transport
as a Hono-mountable app. No hand-written tool schemas, no config drift — the contract is the single source.
Pure projection (`toolsFrom`) + pure protocol (`handleRpc`) are independently testable; `mcpApp` wires transport.
CANDIDATE tooling — NOT official OAS.
```ts
toolsFrom(doc: OpenAPIv4Document, opts: ToolsOptions): McpTool[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `opts: ToolsOptions` — default: `{}`
**Returns:** `McpTool[]`

## protocol

### `handleRpc`
Dispatch one JSON-RPC message. Returns `null` ONLY for a notification — a message with no `id` MEMBER; the caller
 then emits no body. Anything carrying an `id` (even the discouraged `id: null`) always gets a correlated response.
```ts
handleRpc(msg: RpcRequest, ctx: RpcContext): Promise<RpcResponse | null>
```
**Parameters:**
- `msg: RpcRequest`
- `ctx: RpcContext`
**Returns:** `Promise<RpcResponse | null>`

## exec

### `buildRequest`
Build the same-origin Request for an operation call. `origin` is trusted; `args` values are caller-supplied.
```ts
buildRequest(op: McpOp, args: Record<string, unknown>, origin: string, headers: Record<string, string>): Request
```
**Parameters:**
- `op: McpOp`
- `args: Record<string, unknown>`
- `origin: string`
- `headers: Record<string, string>` — default: `{}`
**Returns:** `Request`

### `originExec`
Default executor — fetch the worker's own public origin. Read-only catalog ops need no auth; mutations (only
 exposed under `include:"all"`) ride the forwarded session. NOTE: on Cloudflare Workers prefer appExec.
```ts
originExec(c: Context, op: McpOp, args: Record<string, unknown>): Promise<unknown>
```
**Parameters:**
- `c: Context`
- `op: McpOp`
- `args: Record<string, unknown>`
**Returns:** `Promise<unknown>`

### `appExec`
In-process executor for when the MCP server is mounted on the SAME app as the store routes. Dispatches the tool's
 request straight through `app.fetch` — same routing, same auth + access middleware, NO network hop (so no edge
 self-loop / 522 on Cloudflare). Pass the host Hono app; it is read lazily at call time, so mounting MCP on that
 same app first is fine. The tool's request (e.g. `GET /product`) never matches the MCP route, so it can't recurse.
```ts
appExec(app: FetchApp): (c: Context, op: McpOp, args: Record<string, unknown>) => Promise<unknown>
```
**Parameters:**
- `app: FetchApp`
**Returns:** `(c: Context, op: McpOp, args: Record<string, unknown>) => Promise<unknown>`

## app

### `mcpApp`
```ts
mcpApp(opts: McpOptions): Hono
```
**Parameters:**
- `opts: McpOptions`
**Returns:** `Hono`
