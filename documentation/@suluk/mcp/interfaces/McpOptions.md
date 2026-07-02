[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/mcp](../README.md) / McpOptions

# Interface: McpOptions

Defined in: [app.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/mcp/src/app.ts#L17)

`@suluk/mcp` — project ONE OpenAPI v4 document into a Model Context Protocol server. The same contract that drives
the API, SDK, docs, admin, and panel now drives an agent-callable surface: every operation becomes an MCP tool
(read-only by default; mutations opt-in via `include:"all"`), served over the Streamable-HTTP JSON-RPC transport
as a Hono-mountable app. No hand-written tool schemas, no config drift — the contract is the single source.
Pure projection (`toolsFrom`) + pure protocol (`handleRpc`) are independently testable; `mcpApp` wires transport.
CANDIDATE tooling — NOT official OAS.

## Extends

- [`ToolsOptions`](ToolsOptions.md)

## Properties

### authorize?

> `optional` **authorize?**: (`c`) => `boolean` \| `Promise`\<`boolean`\>

Defined in: [app.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/mcp/src/app.ts#L27)

Gate the whole endpoint — return true to allow. Default: open (read-only catalog browsing).

#### Parameters

##### c

`Context`

#### Returns

`boolean` \| `Promise`\<`boolean`\>

***

### basePath?

> `optional` **basePath?**: `string`

Defined in: [app.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/mcp/src/app.ts#L20)

***

### cors?

> `optional` **cors?**: `boolean`

Defined in: [app.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/mcp/src/app.ts#L31)

Send permissive CORS so browser-based MCP clients can reach a public read-only server (default: true).

***

### document

> **document**: [`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md) \| ((`c`) => [`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md) \| `Promise`\<[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)\>)

Defined in: [app.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/mcp/src/app.ts#L19)

The v4 document — a value, or a per-request function (e.g. return projectDocument(doc, roleOf(c))).

***

### exec?

> `optional` **exec?**: (`c`, `op`, `args`) => `Promise`\<`unknown`\>

Defined in: [app.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/mcp/src/app.ts#L29)

Override how a tool call is executed (default: same-origin fetch via [originExec](../functions/originExec.md)).

#### Parameters

##### c

`Context`

##### op

[`McpOp`](McpOp.md)

##### args

`Record`\<`string`, `unknown`\>

#### Returns

`Promise`\<`unknown`\>

***

### hide?

> `optional` **hide?**: `string`[]

Defined in: [tools.ts:36](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/mcp/src/tools.ts#L36)

Operation names to omit.

#### Inherited from

[`ToolsOptions`](ToolsOptions.md).[`hide`](ToolsOptions.md#hide)

***

### include?

> `optional` **include?**: `"read"` \| `"all"`

Defined in: [tools.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/mcp/src/tools.ts#L34)

`"read"` (default) exposes only GET/HEAD operations; `"all"` also exposes mutations.

#### Inherited from

[`ToolsOptions`](ToolsOptions.md).[`include`](ToolsOptions.md#include)

***

### includeDeprecated?

> `optional` **includeDeprecated?**: `boolean`

Defined in: [tools.ts:40](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/mcp/src/tools.ts#L40)

Include `deprecated` operations (default: skip them).

#### Inherited from

[`ToolsOptions`](ToolsOptions.md).[`includeDeprecated`](ToolsOptions.md#includedeprecated)

***

### instructions?

> `optional` **instructions?**: `string`

Defined in: [app.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/mcp/src/app.ts#L25)

Free-text guidance surfaced to the model on `initialize`.

***

### name?

> `optional` **name?**: `string`

Defined in: [app.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/mcp/src/app.ts#L22)

Advertised server identity.

***

### only?

> `optional` **only?**: `string`[]

Defined in: [tools.ts:38](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/mcp/src/tools.ts#L38)

If set, expose ONLY these operation names (after hide).

#### Inherited from

[`ToolsOptions`](ToolsOptions.md).[`only`](ToolsOptions.md#only)

***

### resident?

> `optional` **resident?**: `string`[] \| ((`c`) => `string`[] \| `Promise`\<`string`[] \| `undefined`\> \| `undefined`)

Defined in: [app.ts:38](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/mcp/src/app.ts#L38)

TIER-TRIM serving (C027): the names of the RESIDENT tools (a value or a per-request resolver). When provided,
`tools/list` serves only these + a `discover_tools` meta-tool, withholding the cold-tail from the default surface
(revealed on demand) — the real, lossless context reduction the agent layer promises. Derive these from an
agent's route tiers, e.g. `@suluk/agents` `residentToolNames(doc, agentName)`. Absent ⇒ the full surface is served.

***

### version?

> `optional` **version?**: `string`

Defined in: [app.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/mcp/src/app.ts#L23)
