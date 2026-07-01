[**Suluk**](../../README.md)

***

[Suluk](../../packages.md) / @suluk/chat

<p align="center">
  <a href="https://github.com/MahmoodKhalil57/suluk">
    <img src="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/wordmark.png" alt="Suluk" width="360" />
  </a>
</p>

# @suluk/chat

**A contract-driven, in-page chat agent that can BROWSE and ACT — over the same OpenAPI v4 operations that drive your API.**

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```sh
bun add @suluk/chat
```

Peer dependency: `hono`. Powered by `@suluk/mcp` (operations → tools), `@suluk/models` (picks the model), and `@suluk/core` (the v4 document). You also need an [OpenRouter](https://openrouter.ai) API key.

## What it does

- **Projects your v4 document into agent tools.** The same operations that drive the API, SDK, docs, admin, and MCP server become function-call tools (via `@suluk/mcp`), so the assistant can list, read, and — when the user is permitted — create/update/delete.
- **Runs an OpenRouter tool-use loop.** No SDK: a `fetch`-based streaming client speaks the OpenAI-compatible wire protocol, so it runs unchanged on Cloudflare Workers, Bun, and Node. The model id is chosen by `@suluk/models` (never hardcoded) unless you pin one.
- **Stays exactly as authorized as the API.** Every server tool call runs through the store's own access gate via the injected `exec`. Pass a per-request *projected* document and you get a per-role agent: anonymous users get read-only catalog tools; signed-in users get the mutations their session allows.
- **Ships both halves.** A Hono-mountable SSE endpoint (`chatApp`) and a framework-agnostic floating widget (`chatWidget`) — theme-aware, streams token-by-token, shows tool-activity chips, renders XSS-safe markdown, keyboard + screen-reader accessible.
- **Hardened against prompt injection.** Client-supplied history is sanitized to user/assistant text only (`sanitizeMessages`); browser-declared client tools are validated and can never shadow a privileged server tool (`sanitizeClientTools`).

## When to reach for it

- You want an **in-app assistant** that can both answer questions about your data and take real actions on the user's behalf, grounded in tool results rather than hallucination.
- You already expose your contract via `@suluk/mcp` and want the *same* per-role operations available to an in-page agent without re-plumbing auth.

Reach for **`@suluk/mcp`** instead when you want an MCP *server* for external clients (Claude Desktop, IDEs) rather than an embedded browser assistant — `@suluk/chat` builds on it. Reach for **`@suluk/scalar` / `@suluk/swagger`** for static API *reference* rendering (no agent, no actions).

## Usage

### Mount the server (Hono)

```ts
import { chatApp } from "@suluk/chat";
import { appExec } from "@suluk/mcp";

// `document` is your @suluk/core OpenAPIv4Document; `app` is the store the ops execute against.
app.route(
  "/",
  chatApp({
    // A per-request function yields a per-role agent — project the doc for the current viewer.
    document: (c) => projectDocument(document, viewerOf(c), canonHash),
    basePath: "/chat",
    include: "all",
    exec: appExec(app),                          // runs each op through the store's own access gate
    apiKey: () => process.env.OPENROUTER_API_KEY, // absent → /chat returns a graceful 503
    title: "saasuluk",
    greeting: "Hi! Ask me to find products, compare plans, or dig through the docs.",
    system: "You are the assistant for this store. Ground answers in tool results. Confirm before any create/update/delete.",
  }),
);
```

This exposes two routes under `basePath`:

- `POST /chat` — streams the agent's reply as SSE (text deltas + `tool` / `client_tool` activity events).
- `GET /chat/info` — reports `{ configured, model, greeting }` (the widget reads this).

Omit `model` to let `@suluk/models` pick a tool-reliable one from the lean built-in `SEED_CATALOG`; pass `model: "anthropic/claude-sonnet-4.5"` (or any OpenRouter id) to pin it. Pass `catalog: OPENROUTER_CATALOG` from `@suluk/models` for full-catalog selection (mind the bundle/cost trade-off).

### Drop in the widget (any page)

```ts
import { chatWidget } from "@suluk/chat";

// chatWidget() returns ONE self-contained HTML string (style + markup + script).
// Inject it before </body> on any page whose backend mounts chatApp.
const html = chatWidget({
  endpoint: "/chat",            // where chatApp is mounted (default /chat)
  title: "saasuluk assistant",
  greeting: "Hi! Ask me anything about this site.",
});
```

The widget is theme-aware via the suluk CSS-var vocabulary (`--accent` / `--panel` / `--fg` / `--line` / `--muted`, with safe fallbacks).

### Browser-executed (client) tools + page state

The page can register **client tools** the model may call but the server never runs — they execute locally (cart, theme, navigation). The widget sends only each tool's *definition* to the server and runs `run(args)` in the browser when the model invokes it. It also sends a read-only state snapshot each turn:

```html
<script>
  // Read-only browser state the agent can reason over (cart, theme, path …).
  window.__sulukChatContext = () => ({ path: location.pathname, cart: window.cart?.items ?? [] });

  // Browser-executed tools: only { name, description, parameters } go to the model; run() stays in the page.
  window.__sulukChatTools = [
    {
      name: "addToCart",
      description: "Add a product to the cart by its numeric product id. Works without signing in.",
      parameters: { type: "object", properties: { productId: { type: "integer" } }, required: ["productId"] },
      run: (a) => window.cart.add({ productId: Number(a.productId), qty: 1 }),
    },
  ];
</script>
```

### Use the pure pieces directly

The agent core is decoupled from the model call and tool execution (both injected), so each piece is independently testable:

```ts
import { runAgent, streamCompletion, toolsToOpenAI } from "@suluk/chat";
import { toolsFrom, appExec } from "@suluk/mcp";

const tools = toolsFrom(document);
const exec = appExec(app);                                 // (c, op, args) → runs the op through the store's gate

const messages = await runAgent(
  {
    messages: [{ role: "user", content: "list products under $50" }],
    tools,
    exec: (op, args) => exec(c, op, args),                 // execute a SERVER tool against the store (c = Hono Context)
    complete: (msgs, oaTools, onText) =>                   // one streamed completion
      streamCompletion({ apiKey }, "anthropic/claude-sonnet-4.5", msgs, oaTools, onText),
    maxSteps: 6,                                           // bounds model round-trips (default 6)
  },
  (ev) => console.log(ev.type),                            // step | text | tool | client_tool | done | error
);
```

`toolsToOpenAI(tools)` maps `@suluk/mcp` descriptors to the OpenAI function-calling shape; `parseSSEStream(body, onText)` accumulates an OpenAI-style SSE stream into a final assistant message (handy for tests or a custom transport).

## API

| Export | Kind | What it does |
| --- | --- | --- |
| `chatApp(opts)` | server | Returns a `Hono` app mounting `POST {basePath}` (SSE agent) + `GET {basePath}/info`. |
| `chatWidget(opts?)` | client | Returns one self-contained HTML string (style + markup + script) for the floating widget. |
| `runAgent(opts, onEvent)` | core | The pure tool-use loop; model call + tool exec are injected. Returns the full message list. |
| `streamCompletion(cfg, model, msgs, tools, onText, signal?)` | core | One streamed OpenRouter completion → final assistant message. |
| `parseSSEStream(body, onText)` | core | Parse an OpenAI-style SSE completion stream (content + accumulated `tool_calls`). |
| `toolsToOpenAI(tools)` | core | Map `@suluk/mcp` tool descriptors → OpenAI/OpenRouter `tools`. |
| `sanitizeMessages(input)` | guard | Keep only user/assistant text turns; drop client-forged system/tool turns + `tool_calls`. |
| `sanitizeClientTools(input, serverNames)` | guard | Validate browser tools; never let one shadow a server tool; cap count + schema size. |
| `DEFAULT_SYSTEM` | const | The default embedded-assistant system prompt. |

Types: `ChatOptions`, `ChatWidgetOptions`, `RunAgentOptions`, `AgentEvent`, `ClientToolDef`, `ChatMessage`, `ToolCall`, `OpenAITool`, `OpenRouterConfig`.

## Boundary

This package **renders and orchestrates — it never hosts** (the L3 line). It does not own auth, your data, or the model: it injects ports for all three.

- **The store is injected.** `exec` is yours (e.g. `appExec(app)`); every server tool call passes through the store's own access gate, so the agent's "act" power is exactly the user's API power — never more.
- **The model is chosen, not bundled.** `@suluk/models` selects it (or you pin it); the OpenRouter key is resolved per-request and stays server-side. No key → a graceful 503.
- **The widget is bytes, not a service.** `chatWidget()` returns an HTML string you serve from your own page; client tools and page state stay in the browser, app-side.

## License

Apache-2.0.

## Interfaces

- [ChatMessage](interfaces/ChatMessage.md)
- [ChatOptions](interfaces/ChatOptions.md)
- [ChatWidgetOptions](interfaces/ChatWidgetOptions.md)
- [ClientToolDef](interfaces/ClientToolDef.md)
- [OpenAITool](interfaces/OpenAITool.md)
- [OpenRouterConfig](interfaces/OpenRouterConfig.md)
- [RunAgentOptions](interfaces/RunAgentOptions.md)
- [ToolCall](interfaces/ToolCall.md)

## Type Aliases

- [AgentEvent](type-aliases/AgentEvent.md)

## Variables

- [DEFAULT\_SYSTEM](variables/DEFAULT_SYSTEM.md)

## Functions

- [chatApp](functions/chatApp.md)
- [chatWidget](functions/chatWidget.md)
- [parseSSEStream](functions/parseSSEStream.md)
- [runAgent](functions/runAgent.md)
- [sanitizeClientTools](functions/sanitizeClientTools.md)
- [sanitizeMessages](functions/sanitizeMessages.md)
- [streamCompletion](functions/streamCompletion.md)
- [toolsToOpenAI](functions/toolsToOpenAI.md)
