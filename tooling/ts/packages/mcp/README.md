# @suluk/mcp

**Project ONE OpenAPI v4 document into an agent-callable MCP server — each operation becomes a tool, read-only by default, zero hand-written tool schemas.**

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor *candidate* of the
> OpenAPI v4.0 ("Moonwalk") line, not a ratified spec. The MCP projection here is a vendor extension;
> treat these artifacts as proposals, pin your versions, and expect churn.

The same contract that drives your API, SDK, docs, admin, and panel now drives a [Model Context
Protocol](https://modelcontextprotocol.io) surface: every operation is projected into one MCP tool,
served over the Streamable-HTTP JSON-RPC transport as a [Hono](https://hono.dev)-mountable app. No
hand-written tool schemas, no config drift — the contract is the single source.

The projection (`toolsFrom`) and the protocol (`handleRpc`) are **pure** and independently testable;
`mcpApp` wires the transport, and the `exec` seam turns a tool call back into an HTTP request against
your own routes.

## Install

```bash
bun add @suluk/mcp
```

`hono` is a peer dependency — bring your own (`bun add hono`).

## What it does

- **Projects each operation into an MCP tool.** Every `Request` in the v4 doc (the named key in
  `pathItem.requests`, C009) becomes one tool; its `inputSchema` flattens the operation's path + query
  params, plus a nested `body` for mutations. The tool name is the operation name, sanitized to MCP's
  `[A-Za-z0-9_-]{1,64}` rule.
- **Read-only by default.** Only GET/HEAD ops are exposed; mutations are opt-in via `include: "all"`.
  Deprecated ops are skipped unless asked for.
- **Speaks the MCP 2025-06-18 Streamable-HTTP transport.** `initialize`, `tools/list`, `tools/call`,
  `ping`, notification swallowing; tool failures are reported in-band (`isError: true`), and arrays
  (removed JSON-RPC batching) are rejected up front.
- **SSRF-safe execution.** A tool call is rebuilt into a same-origin HTTP request — argument values are
  only ever `encodeURIComponent`'d into the path template or set as `searchParams`, so a caller
  influences VALUES, never the scheme/host/route. The caller's session is forwarded so an authenticated
  agent acts as itself.
- **Tier-trim serving (C027).** Advertise only a *resident* set in `tools/list` and withhold the
  cold-tail behind a synthetic `discover_tools` meta-tool — a real, lossless context reduction
  (cold-tail tools stay callable by name).

## When to reach for it

Reach for `@suluk/mcp` when you have a v4 document and want to expose its operations to LLM agents over
MCP — the runtime surface a Claude/Cursor/OpenRouter client connects to and calls.

Its sibling `@suluk/agents` is the *composition* layer above this: it projects + lints + signs the
`x-suluk-agents` contract and tells you *which* tools should be resident (`residentToolNames`). This
package *serves* that surface. Use them together: `@suluk/agents` decides the surface, `@suluk/mcp`
hosts it.

## Usage

### Mount an MCP server (the common case)

`mcpApp` returns a Hono app you mount on your existing routes. Pass the v4 `document` (a value or a
per-request function, so a per-role document yields a per-role tool set for free).

```ts
import { mcpApp, appExec } from "@suluk/mcp";

const mcp = mcpApp({
  document,                 // your OpenAPIv4Document (or (c) => projectDocument(document, roleOf(c)))
  basePath: "/mcp",         // default "/mcp"
  name: "saasuluk",
  include: "read",          // "read" (default, GET/HEAD only) | "all" (also mutations)
  exec: appExec(app),       // dispatch tool calls in-process through the SAME host app — see below
  instructions: "Browse the saasuluk store: list and read products, posts, and categories.",
});

app.route("/", mcp);        // now POST /mcp speaks JSON-RPC; GET /mcp → 405 (no server→client stream)
```

By default `mcpApp` executes a tool by fetching the worker's **own public origin** (`originExec`). On
Cloudflare Workers a self-fetch to the public hostname loops through the edge and 522s — so when the
MCP server is mounted on the **same app** as the store routes, pass `exec: appExec(app)` to dispatch
straight through `app.fetch` (same routing, same auth + access middleware, no network hop). The host
app is read lazily, so mounting MCP on that same `app` first is fine.

### Gate it + tier-trim the surface

```ts
import { mcpApp } from "@suluk/mcp";
import { residentToolNames } from "@suluk/agents"; // optional: derive resident tools from an agent contract

mcpApp({
  document,
  include: "all",
  authorize: (c) => Boolean(c.req.header("authorization")),  // return true to allow; default: open
  hide: ["internalReindex"],                                  // omit ops by name
  resident: (c) => residentToolNames(document, "shopAgent"), // tools/list serves only these + discover_tools
});
```

### Project tools (pure) — no transport

`toolsFrom` is a pure function of `(doc, opts)` — useful for inspection, tests, or feeding another
serving layer.

```ts
import { toolsFrom } from "@suluk/mcp";

const tools = toolsFrom(doc);                     // read-only: GET/HEAD ops only
toolsFrom(doc, { include: "all" });               // also POST/PUT/PATCH/DELETE (body under `body`)
toolsFrom(doc, { only: ["listProduct"] });        // expose ONLY these op names
toolsFrom(doc, { hide: ["deleteProduct"] });      // omit these op names

const get = tools.find((t) => t.name === "getProduct")!;
get.inputSchema;   // { type:"object", properties:{ id:… }, required:["id"], additionalProperties:false }
get.op;            // { name, method:"GET", path:"/product/{id}", pathParams:["id"], queryParams:[], hasBody:false, readOnly:true }
```

### Drive the protocol directly (pure)

`handleRpc` dispatches one JSON-RPC message against an `RpcContext` you assemble — `exec` is injected,
so you can unit-test the protocol with no network at all.

```ts
import { handleRpc, type RpcContext } from "@suluk/mcp";

const ctx: RpcContext = {
  tools: toolsFrom(doc),
  info: { name: "shop", version: "1.0.0" },
  exec: async (op, args) => callMyApi(op, args),   // McpOp + args → result (you choose how)
  instructions: "Read-only catalog browsing.",
  // resident: new Set(["listProduct"]),           // opt-in tier-trim
};

await handleRpc({ jsonrpc: "2.0", id: 1, method: "initialize" }, ctx);
await handleRpc({ jsonrpc: "2.0", id: 2, method: "tools/list" }, ctx);
await handleRpc({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "getProduct", arguments: { id: 7 } } }, ctx);
// notifications (no `id`) return null → emit no body; a tool throw → in-band { isError: true }, not a protocol error
```

### Build the same-origin request yourself

`buildRequest` is the SSRF-safe core of execution — exposed if you want to route an op's HTTP request
through a custom transport. `originExec` / `appExec` are the two built-in executors.

```ts
import { buildRequest } from "@suluk/mcp";

const op = toolsFrom(doc).find((t) => t.name === "getProduct")!.op;
const req = buildRequest(op, { id: "../../etc/passwd" }, "https://shop.example");
new URL(req.url).pathname;   // "/product/..%2F..%2Fetc%2Fpasswd" — traversal neutralized; origin fixed
```

## API

All exports live at the single entry point (`@suluk/mcp`) — there are no sub-path exports and no CLI.

| Export | What it does |
|---|---|
| `mcpApp` | mount a contract-projected MCP server (Streamable-HTTP, Hono) — the main entry |
| `toolsFrom` | pure projection: a v4 doc → `McpTool[]` (read-only by default; `include`/`hide`/`only`/`includeDeprecated`) |
| `handleRpc` | pure JSON-RPC dispatch for one MCP message against an `RpcContext` |
| `originExec` | executor that fetches the worker's own public origin (dev / Node / Bun / separate backend) |
| `appExec` | in-process executor — dispatch through the SAME host `app.fetch` (the Cloudflare Worker case) |
| `buildRequest` | the SSRF-safe `McpOp` + args → same-origin `Request` builder |
| `DISCOVER_TOOL` | the synthetic `discover_tools` meta-tool that reveals the tier-trim cold-tail |
| `LATEST_PROTOCOL` / `SUPPORTED_PROTOCOLS` | the served protocol version (`2025-06-18`) + the supported set |
| `McpTool` / `McpOp` / `ToolsOptions` | projection types |
| `RpcRequest` / `RpcResponse` / `RpcContext` / `ToolExec` | protocol types |
| `McpOptions` / `FetchApp` | `mcpApp` options + the minimal `{ fetch }` shape `appExec` accepts |

## Boundary

`@suluk/mcp` is L3: **render/serve, never own the store.** It projects the contract and speaks the MCP
transport — it never owns your data, auth, or business logic. The executor is an injected seam:

- **Inject the transport.** `exec` decides how a tool call reaches your API — `appExec(app)` (in-process,
  the recommended Worker path), `originExec` (same-origin fetch), or your own function. The package only
  ever builds a *same-origin* request; it cannot reach another host.
- **Auth stays app-side.** `mcpApp` forwards the caller's `cookie` / `authorization` to your routes so
  the agent acts as the signed-in user; the actual access decision is made by your store's middleware,
  not here. `authorize` is a coarse endpoint gate, not the per-operation check.
- **The surface is decided upstream.** `resident` / `residentToolNames` come from `@suluk/agents`; this
  package serves what it is told. Read-only-by-default is the safe floor — mutations are opt-in.

## License

Apache-2.0
