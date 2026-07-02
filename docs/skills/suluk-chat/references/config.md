# Configuration

## ChatOptions

`@suluk/chat` — a contract-driven chat AGENT for any suluk app. The same OpenAPI v4 operations that drive the API,
SDK, docs, admin, panel, and MCP server are projected (via @suluk/mcp) into tools an in-page assistant can call;
an OpenRouter tool-use loop drives them, with the model chosen by @suluk/models (never hardcoded) and every call
executed through the store's own access gate — so the agent can BROWSE and, when the user is permitted, ACT.
Ships the server loop (`chatApp`, Hono-mountable SSE) + a theme-aware floating `chatWidget`. Pure pieces
(`runAgent`, `parseSSEStream`, `toolsToOpenAI`) are independently testable. CANDIDATE tooling — NOT official OAS.

### Properties

#### document

The v4 document, or a per-request function (e.g. (c) => projectDocument(doc, viewerOf(c))).

**Type:** `OpenAPIv4Document | ((c: Context) => OpenAPIv4Document | Promise<OpenAPIv4Document>)`

**Required:** yes

#### basePath

**Type:** `string`

#### apiKey

OpenRouter API key (or a per-request resolver, e.g. (c) => c.env.OPENROUTER_API_KEY). Absent → graceful 503.

**Type:** `string | ((c: Context) => string | undefined)`

#### model

Explicit OpenRouter model id; omit to let @suluk/models pick one (default: tool-reliable).

**Type:** `string`

#### select

Model-selection inputs when `model` is omitted.

**Type:** `{ reqs?: HardFilters; prefs?: Preferences }`

#### catalog

The catalog the model is selected from when `model` is omitted. Defaults to the lean built-in `SEED_CATALOG` (a
handful of strong, tool-reliable models) — which keeps this widget's edge-worker bundle small (the full 337-model
`OPENROUTER_CATALOG` adds ~150KB gzipped, and under the default `tool-reliable` profile it selects a pricier
FRONTIER model — e.g. claude-sonnet-4.5 vs the seed's gemini-2.5-flash). Pass `OPENROUTER_CATALOG` from
`@suluk/models` for always-current, full-catalog selection (mind the cost/bundle trade-off).

**Type:** `ModelCatalog`

#### exec

Execute a tool call against the store (e.g. appExec(app) bound per request).

**Type:** `(c: Context, op: McpOp, args: Record<string, unknown>) => Promise<unknown>`

**Required:** yes

#### system

**Type:** `string | ((c: Context) => string)`

#### clientTools

Set `false` to ignore any browser-declared client tools / state snapshot from the request (default: accept,
 validated). Client tools are browser-executed and unprivileged; server tools always stay gated by `exec`.

**Type:** `false`

#### authorize

Gate the endpoint (default: open — anonymous users may chat; mutations are still gated by `exec`).

**Type:** `(c: Context) => boolean | Promise<boolean>`

#### maxSteps

**Type:** `number`

#### temperature

**Type:** `number`

#### referer

OpenRouter attribution.

**Type:** `string`

#### title

**Type:** `string`

#### baseUrl

**Type:** `string`

#### greeting

Shown by GET /info (e.g. the widget's opening line).

**Type:** `string`

#### include

`"read"` (default) exposes only GET/HEAD operations; `"all"` also exposes mutations.

**Type:** `"read" | "all"`

#### hide

Operation names to omit.

**Type:** `string[]`

#### only

If set, expose ONLY these operation names (after hide).

**Type:** `string[]`

## RunAgentOptions

### Properties

#### messages

Conversation so far (user/assistant turns); the system prompt is prepended from `system`.

**Type:** `ChatMessage[]`

**Required:** yes

#### tools

**Type:** `McpTool[]`

**Required:** yes

#### clientTools

Browser-executed tool definitions (no handler) — surfaced to the model, dispatched to the widget by name.

**Type:** `ClientToolDef[]`

#### exec

Execute a SERVER tool call against the store (e.g. appExec bound to the request).

**Type:** `(op: McpOp, args: Record<string, unknown>) => Promise<unknown>`

**Required:** yes

#### complete

One streamed model completion: stream text via onText, resolve to the final assistant message.

**Type:** `(messages: ChatMessage[], tools: OpenAITool[], onText: (d: string) => void | Promise<void>) => Promise<ChatMessage>`

**Required:** yes

#### system

**Type:** `string`

#### maxSteps

max model round-trips before forcing a stop (default 6).

**Type:** `number`

#### maxResultChars

cap each tool result's serialized length fed back to the model (default 8000 chars).

**Type:** `number`

## OpenRouterConfig

### Properties

#### apiKey

**Type:** `string`

**Required:** yes

#### baseUrl

default https://openrouter.ai/api/v1

**Type:** `string`

#### referer

OpenRouter ranking attribution (optional).

**Type:** `string`

#### title

**Type:** `string`

#### temperature

**Type:** `number`

## ChatWidgetOptions

### Properties

#### endpoint

Where chatApp is mounted (default /chat).

**Type:** `string`

#### title

Panel header + launcher aria-label.

**Type:** `string`

#### greeting

First assistant line shown when the panel opens (overridden by GET {endpoint}/info if it returns a greeting).

**Type:** `string`

#### placeholder

**Type:** `string`