[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/chat](../README.md) / ChatOptions

# Interface: ChatOptions

Defined in: [chat/src/app.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/chat/src/app.ts#L25)

`@suluk/chat` — a contract-driven chat AGENT for any suluk app. The same OpenAPI v4 operations that drive the API,
SDK, docs, admin, panel, and MCP server are projected (via @suluk/mcp) into tools an in-page assistant can call;
an OpenRouter tool-use loop drives them, with the model chosen by @suluk/models (never hardcoded) and every call
executed through the store's own access gate — so the agent can BROWSE and, when the user is permitted, ACT.
Ships the server loop (`chatApp`, Hono-mountable SSE) + a theme-aware floating `chatWidget`. Pure pieces
(`runAgent`, `parseSSEStream`, `toolsToOpenAI`) are independently testable. CANDIDATE tooling — NOT official OAS.

## Extends

- `Pick`\<[`ToolsOptions`](../../mcp/interfaces/ToolsOptions.md), `"include"` \| `"hide"` \| `"only"`\>

## Properties

### apiKey?

> `optional` **apiKey?**: `string` \| ((`c`) => `string` \| `undefined`)

Defined in: [chat/src/app.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/chat/src/app.ts#L30)

OpenRouter API key (or a per-request resolver, e.g. (c) => c.env.OPENROUTER_API_KEY). Absent → graceful 503.

***

### authorize?

> `optional` **authorize?**: (`c`) => `boolean` \| `Promise`\<`boolean`\>

Defined in: [chat/src/app.ts:50](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/chat/src/app.ts#L50)

Gate the endpoint (default: open — anonymous users may chat; mutations are still gated by `exec`).

#### Parameters

##### c

`Context`

#### Returns

`boolean` \| `Promise`\<`boolean`\>

***

### basePath?

> `optional` **basePath?**: `string`

Defined in: [chat/src/app.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/chat/src/app.ts#L28)

***

### baseUrl?

> `optional` **baseUrl?**: `string`

Defined in: [chat/src/app.ts:56](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/chat/src/app.ts#L56)

***

### catalog?

> `optional` **catalog?**: [`ModelCatalog`](../../agents/interfaces/ModelCatalog.md)

Defined in: [chat/src/app.ts:42](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/chat/src/app.ts#L42)

The catalog the model is selected from when `model` is omitted. Defaults to the lean built-in `SEED_CATALOG` (a
handful of strong, tool-reliable models) — which keeps this widget's edge-worker bundle small (the full 337-model
`OPENROUTER_CATALOG` adds ~150KB gzipped, and under the default `tool-reliable` profile it selects a pricier
FRONTIER model — e.g. claude-sonnet-4.5 vs the seed's gemini-2.5-flash). Pass `OPENROUTER_CATALOG` from
`@suluk/models` for always-current, full-catalog selection (mind the cost/bundle trade-off).

***

### clientTools?

> `optional` **clientTools?**: `false`

Defined in: [chat/src/app.ts:48](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/chat/src/app.ts#L48)

Set `false` to ignore any browser-declared client tools / state snapshot from the request (default: accept,
 validated). Client tools are browser-executed and unprivileged; server tools always stay gated by `exec`.

***

### document

> **document**: [`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md) \| ((`c`) => [`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md) \| `Promise`\<[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)\>)

Defined in: [chat/src/app.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/chat/src/app.ts#L27)

The v4 document, or a per-request function (e.g. (c) => projectDocument(doc, viewerOf(c))).

***

### exec

> **exec**: (`c`, `op`, `args`) => `Promise`\<`unknown`\>

Defined in: [chat/src/app.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/chat/src/app.ts#L44)

Execute a tool call against the store (e.g. appExec(app) bound per request).

#### Parameters

##### c

`Context`

##### op

[`McpOp`](../../mcp/interfaces/McpOp.md)

##### args

`Record`\<`string`, `unknown`\>

#### Returns

`Promise`\<`unknown`\>

***

### greeting?

> `optional` **greeting?**: `string`

Defined in: [chat/src/app.ts:58](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/chat/src/app.ts#L58)

Shown by GET /info (e.g. the widget's opening line).

***

### hide?

> `optional` **hide?**: `string`[]

Defined in: [mcp/src/tools.ts:36](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/mcp/src/tools.ts#L36)

Operation names to omit.

#### Inherited from

`Pick.hide`

***

### include?

> `optional` **include?**: `"read"` \| `"all"`

Defined in: [mcp/src/tools.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/mcp/src/tools.ts#L34)

`"read"` (default) exposes only GET/HEAD operations; `"all"` also exposes mutations.

#### Inherited from

`Pick.include`

***

### maxSteps?

> `optional` **maxSteps?**: `number`

Defined in: [chat/src/app.ts:51](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/chat/src/app.ts#L51)

***

### model?

> `optional` **model?**: `string`

Defined in: [chat/src/app.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/chat/src/app.ts#L32)

Explicit OpenRouter model id; omit to let @suluk/models pick one (default: tool-reliable).

***

### only?

> `optional` **only?**: `string`[]

Defined in: [mcp/src/tools.ts:38](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/mcp/src/tools.ts#L38)

If set, expose ONLY these operation names (after hide).

#### Inherited from

`Pick.only`

***

### referer?

> `optional` **referer?**: `string`

Defined in: [chat/src/app.ts:54](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/chat/src/app.ts#L54)

OpenRouter attribution.

***

### select?

> `optional` **select?**: `object`

Defined in: [chat/src/app.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/chat/src/app.ts#L34)

Model-selection inputs when `model` is omitted.

#### prefs?

> `optional` **prefs?**: [`Preferences`](../../agents/interfaces/Preferences.md)

#### reqs?

> `optional` **reqs?**: [`HardFilters`](../../agents/interfaces/HardFilters.md)

***

### system?

> `optional` **system?**: `string` \| ((`c`) => `string`)

Defined in: [chat/src/app.ts:45](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/chat/src/app.ts#L45)

***

### temperature?

> `optional` **temperature?**: `number`

Defined in: [chat/src/app.ts:52](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/chat/src/app.ts#L52)

***

### title?

> `optional` **title?**: `string`

Defined in: [chat/src/app.ts:55](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/chat/src/app.ts#L55)
