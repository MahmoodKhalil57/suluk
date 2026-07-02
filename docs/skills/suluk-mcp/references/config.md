# Configuration

## ToolsOptions

`@suluk/mcp` — project ONE OpenAPI v4 document into a Model Context Protocol server. The same contract that drives
the API, SDK, docs, admin, and panel now drives an agent-callable surface: every operation becomes an MCP tool
(read-only by default; mutations opt-in via `include:"all"`), served over the Streamable-HTTP JSON-RPC transport
as a Hono-mountable app. No hand-written tool schemas, no config drift — the contract is the single source.
Pure projection (`toolsFrom`) + pure protocol (`handleRpc`) are independently testable; `mcpApp` wires transport.
CANDIDATE tooling — NOT official OAS.

### Properties

#### include

`"read"` (default) exposes only GET/HEAD operations; `"all"` also exposes mutations.

**Type:** `"read" | "all"`

#### hide

Operation names to omit.

**Type:** `string[]`

#### only

If set, expose ONLY these operation names (after hide).

**Type:** `string[]`

#### includeDeprecated

Include `deprecated` operations (default: skip them).

**Type:** `boolean`

## McpOptions

`@suluk/mcp` — project ONE OpenAPI v4 document into a Model Context Protocol server. The same contract that drives
the API, SDK, docs, admin, and panel now drives an agent-callable surface: every operation becomes an MCP tool
(read-only by default; mutations opt-in via `include:"all"`), served over the Streamable-HTTP JSON-RPC transport
as a Hono-mountable app. No hand-written tool schemas, no config drift — the contract is the single source.
Pure projection (`toolsFrom`) + pure protocol (`handleRpc`) are independently testable; `mcpApp` wires transport.
CANDIDATE tooling — NOT official OAS.

### Properties

#### document

The v4 document — a value, or a per-request function (e.g. return projectDocument(doc, roleOf(c))).

**Type:** `OpenAPIv4Document | ((c: Context) => OpenAPIv4Document | Promise<OpenAPIv4Document>)`

**Required:** yes

#### basePath

**Type:** `string`

#### name

Advertised server identity.

**Type:** `string`

#### version

**Type:** `string`

#### instructions

Free-text guidance surfaced to the model on `initialize`.

**Type:** `string`

#### authorize

Gate the whole endpoint — return true to allow. Default: open (read-only catalog browsing).

**Type:** `(c: Context) => boolean | Promise<boolean>`

#### exec

Override how a tool call is executed (default: same-origin fetch via originExec).

**Type:** `(c: Context, op: McpOp, args: Record<string, unknown>) => Promise<unknown>`

#### cors

Send permissive CORS so browser-based MCP clients can reach a public read-only server (default: true).

**Type:** `boolean`

#### resident

TIER-TRIM serving (C027): the names of the RESIDENT tools (a value or a per-request resolver). When provided,
`tools/list` serves only these + a `discover_tools` meta-tool, withholding the cold-tail from the default surface
(revealed on demand) — the real, lossless context reduction the agent layer promises. Derive these from an
agent's route tiers, e.g. `@suluk/agents` `residentToolNames(doc, agentName)`. Absent ⇒ the full surface is served.

**Type:** `string[] | ((c: Context) => string[] | Promise<string[] | undefined> | undefined)`

#### include

`"read"` (default) exposes only GET/HEAD operations; `"all"` also exposes mutations.

**Type:** `"read" | "all"`

#### hide

Operation names to omit.

**Type:** `string[]`

#### only

If set, expose ONLY these operation names (after hide).

**Type:** `string[]`

#### includeDeprecated

Include `deprecated` operations (default: skip them).

**Type:** `boolean`