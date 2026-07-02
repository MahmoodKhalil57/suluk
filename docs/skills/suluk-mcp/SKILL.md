---
description: "Project ONE OpenAPI v4 document into a Model Context Protocol (MCP) server: each operation becomes an MCP tool (read-only by default), served over the Streamable-HTTP JSON-RPC transport as a Hono-mountable app. Same contract that drives the API/SDK/docs/admin/panel now drives an agent-callable surface — zero hand-written tool schemas. CANDIDATE tooling — NOT official OAS."
name: suluk-mcp
---

# @suluk/mcp

Project ONE OpenAPI v4 document into a Model Context Protocol (MCP) server: each operation becomes an MCP tool (read-only by default), served over the Streamable-HTTP JSON-RPC transport as a Hono-mountable app. Same contract that drives the API/SDK/docs/admin/panel now drives an agent-callable surface — zero hand-written tool schemas. CANDIDATE tooling — NOT official OAS.

## Quick Start

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

## Configuration

2 configuration interfaces — see references/config.md for details.

## Quick Reference

**tools:** `toolsFrom` (`@suluk/mcp` — project ONE OpenAPI v4 document into a Model Context Protocol server), `McpTool` (`@suluk/mcp` — project ONE OpenAPI v4 document into a Model Context Protocol server), `McpOp` (`@suluk/mcp` — project ONE OpenAPI v4 document into a Model Context Protocol server)
**protocol:** `handleRpc` (Dispatch one JSON-RPC message), `RpcRequest`, `RpcResponse`, `RpcContext`, `ToolExec`, `DISCOVER_TOOL` (The synthetic meta-tool that reveals the cold-tail), `LATEST_PROTOCOL`, `SUPPORTED_PROTOCOLS`
**exec:** `buildRequest` (Build the same-origin Request for an operation call), `originExec` (Default executor — fetch the worker's own public origin), `appExec` (In-process executor for when the MCP server is mounted on the SAME app as the store routes), `FetchApp`
**app:** `mcpApp`

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)