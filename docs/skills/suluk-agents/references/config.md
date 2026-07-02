# Configuration

## ClaudePluginOptions

### Properties

#### mcpUrl

the HTTP MCP endpoint the plugin connects to (e.g. https://host/mcp).

**Type:** `string`

**Required:** yes

#### version

**Type:** `string`

#### displayName

**Type:** `string`

#### homepage

**Type:** `string`

#### keywords

**Type:** `string[]`

#### author

**Type:** `{ name: string; email?: string }`

#### instructions

pinned instruction snapshots, keyed `"<agent>/<skill>"` (preferred, unambiguous) or bare `"<skill>"` (back-compat); a skill without one emits no SKILL.md.

**Type:** `Record<string, string>`

## OpenRouterOptions

### Properties

#### instructions

pinned snapshots keyed `"<agent>/<skill>"` (preferred) or bare `"<skill>"`; when given for the primary skill, the manifest carries the computed hash.

**Type:** `Record<string, string>`

## CloudflareAgentOptions

### Properties

#### className

the Durable Object class + binding name (default: PascalCase of the agent name).

**Type:** `string`

#### instructions

pinned snapshots keyed `"<agent>/<skill>"` (preferred) or bare `"<skill>"`; the primary skill's text is inlined as the system prompt.

**Type:** `Record<string, string>`

#### mcpUrl

an MCP endpoint the tool `execute` stubs can dispatch to — referenced in a comment, never embedded as a credential.

**Type:** `string`

## NodeAgentOptions

### Properties

#### name

the exported server/agent name (default: PascalCase of the agent name). Used only in a comment + the file name.

**Type:** `string`

#### instructions

pinned snapshots keyed `"<agent>/<skill>"` (preferred) or bare `"<skill>"`; the primary skill's text is the system prompt.

**Type:** `Record<string, string>`

#### mcpUrl

an MCP endpoint the tool `execute` stubs can dispatch to — referenced in a comment, never embedded as a credential.

**Type:** `string`

#### port

the port the generated `Bun.serve` listens on (default 8787).

**Type:** `number`

## ContextOptions

### Properties

#### instructions

**Type:** `Record<string, string>`

#### catalog

the model catalog (@suluk/models) — context windows are read from it; replaces the old hard-coded table.

**Type:** `ModelCatalog`

#### modelWindows

per-id window overrides (takes precedence over the catalog); handy for tests/pins.

**Type:** `Record<string, number>`

## AgentDiagramOptions

### Properties

#### title

**Type:** `string`

#### d3Src

override the D3 source (default: jsDelivr CDN). Pass a vendored path for an offline/CSP-locked host.

**Type:** `string`

## AgentGradeOptions

### Properties

#### instructions

instruction snapshots keyed `"<agent>/<skill>"` — lets the context analyzer MEASURE instruction load (else lower-bound).

**Type:** `Record<string, string>`

#### catalog

the @suluk/models catalog — enables the model-fit dimension (window vs estimated peak load).

**Type:** `ModelCatalog`

#### modelWindows

per-id context-window overrides (tests/pins; takes precedence over the catalog).

**Type:** `Record<string, number>`

#### served

the tools a server actually advertises by default — folds in the over-serve + cold-tail-in-default conformance checks.

**Type:** `string[]`

#### snapshots

the CURRENT served instruction snapshot, keyed qualified `"<agent>/<skill>"` (wins) OR bare `"<skill>"` (back-compat) — same dual-accept as `instructions` + `verifyAgentFreshness`; folds in the skill-freshness (drift) check.

**Type:** `Record<string, string>`