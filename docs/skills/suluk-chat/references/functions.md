# Functions

## app

### `chatApp`
`@suluk/chat` — a contract-driven chat AGENT for any suluk app. The same OpenAPI v4 operations that drive the API,
SDK, docs, admin, panel, and MCP server are projected (via @suluk/mcp) into tools an in-page assistant can call;
an OpenRouter tool-use loop drives them, with the model chosen by @suluk/models (never hardcoded) and every call
executed through the store's own access gate — so the agent can BROWSE and, when the user is permitted, ACT.
Ships the server loop (`chatApp`, Hono-mountable SSE) + a theme-aware floating `chatWidget`. Pure pieces
(`runAgent`, `parseSSEStream`, `toolsToOpenAI`) are independently testable. CANDIDATE tooling — NOT official OAS.
```ts
chatApp(opts: ChatOptions): Hono
```
**Parameters:**
- `opts: ChatOptions`
**Returns:** `Hono`

### `sanitizeMessages`
Sanitize client-supplied history: ONLY user/assistant text turns survive — no client-forged system/tool turns or
 tool_calls (which would be a prompt-injection / fake-result vector). Trim to the last MAX_TURNS.
```ts
sanitizeMessages(input: unknown): ChatMessage[]
```
**Parameters:**
- `input: unknown`
**Returns:** `ChatMessage[]`

### `sanitizeClientTools`
Validate client-declared browser tools: well-formed names only, capped, and NEVER allowed to shadow a server
 tool (a forged client tool with a server tool's name would otherwise hijack a privileged op into the browser).
```ts
sanitizeClientTools(input: unknown, serverNames: Set<string>): ClientToolDef[]
```
**Parameters:**
- `input: unknown`
- `serverNames: Set<string>`
**Returns:** `ClientToolDef[]`

## loop

### `runAgent`
```ts
runAgent(o: RunAgentOptions, onEvent: (e: AgentEvent) => void | Promise<void>): Promise<ChatMessage[]>
```
**Parameters:**
- `o: RunAgentOptions`
- `onEvent: (e: AgentEvent) => void | Promise<void>`
**Returns:** `Promise<ChatMessage[]>`

## openrouter

### `streamCompletion`
One streamed chat completion. Forwards assistant text deltas to `onText` as they arrive and returns the FINAL
assistant message (with any accumulated `tool_calls`). Throws on a non-2xx (the loop reports it to the client).
```ts
streamCompletion(cfg: OpenRouterConfig, model: string, messages: ChatMessage[], tools: OpenAITool[], onText: (delta: string) => void | Promise<void>, signal?: AbortSignal): Promise<ChatMessage>
```
**Parameters:**
- `cfg: OpenRouterConfig`
- `model: string`
- `messages: ChatMessage[]`
- `tools: OpenAITool[]`
- `onText: (delta: string) => void | Promise<void>`
- `signal: AbortSignal` (optional)
**Returns:** `Promise<ChatMessage>`

### `parseSSEStream`
Parse an OpenAI-style SSE completion stream: forward `delta.content`, accumulate `delta.tool_calls` by index.
```ts
parseSSEStream(body: ReadableStream<Uint8Array<ArrayBufferLike>>, onText: (delta: string) => void | Promise<void>): Promise<ChatMessage>
```
**Parameters:**
- `body: ReadableStream<Uint8Array<ArrayBufferLike>>`
- `onText: (delta: string) => void | Promise<void>`
**Returns:** `Promise<ChatMessage>`

### `toolsToOpenAI`
Map @suluk/mcp tool descriptors to OpenAI/OpenRouter `tools` (function-calling) shape.
```ts
toolsToOpenAI(tools: McpTool[]): OpenAITool[]
```
**Parameters:**
- `tools: McpTool[]`
**Returns:** `OpenAITool[]`

## widget

### `chatWidget`
```ts
chatWidget(opts: ChatWidgetOptions): string
```
**Parameters:**
- `opts: ChatWidgetOptions` — default: `{}`
**Returns:** `string`
