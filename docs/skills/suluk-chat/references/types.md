# Types & Enums

## loop

### `AgentEvent`
```ts
{ type: "step"; n: number } | { type: "text"; delta: string } | { type: "tool"; phase: "start" | "end"; name: string; ok?: boolean } | { type: "client_tool"; name: string; args: Record<string, unknown> } | { type: "done"; reason: "stop" | "max-steps" } | { type: "error"; message: string }
```

### `ClientToolDef`
A browser-executed tool: the model can call it, but the WORKER never runs it — it streams a `client_tool` event
 to the widget, which executes the action (cart, theme, navigation, …) locally. Defs only (no handler) reach the
 server. Reads should come from the per-turn client-state snapshot, not these (which return only a generic ack).
**Properties:**
- `name: string`
- `description: string`
- `parameters: object`

## openrouter

### `ChatMessage`
**Properties:**
- `role: "tool" | "system" | "user" | "assistant"`
- `content: string | null` (optional)
- `tool_calls: ToolCall[]` (optional) — assistant turns that call tools
- `tool_call_id: string` (optional) — tool-result turns reference the call they answer
- `name: string` (optional)

### `ToolCall`
**Properties:**
- `id: string`
- `type: "function"`
- `function: { name: string; arguments: string }`

### `OpenAITool`
**Properties:**
- `type: "function"`
- `function: { name: string; description: string; parameters: object }`
