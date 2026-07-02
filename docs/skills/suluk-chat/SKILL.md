---
description: "A contract-driven chat AGENT for any suluk app: an in-page floating assistant that can browse AND act, by running an OpenRouter tool-use loop over the SAME OpenAPI v4 operations (projected via @suluk/mcp, executed in-process via the store's own access gate) — with the model chosen by @suluk/models, never hardcoded. Ships the server loop (Hono-mountable SSE) + a theme-aware floating widget. CANDIDATE tooling — NOT official OAS."
name: suluk-chat
---

# @suluk/chat

A contract-driven chat AGENT for any suluk app: an in-page floating assistant that can browse AND act, by running an OpenRouter tool-use loop over the SAME OpenAPI v4 operations (projected via @suluk/mcp, executed in-process via the store's own access gate) — with the model chosen by @suluk/models, never hardcoded. Ships the server loop (Hono-mountable SSE) + a theme-aware floating widget. CANDIDATE tooling — NOT official OAS.

## Quick Start

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

## Configuration

4 configuration interfaces — see references/config.md for details.

## Quick Reference

**app:** `chatApp` (`@suluk/chat` — a contract-driven chat AGENT for any suluk app), `sanitizeMessages` (Sanitize client-supplied history: ONLY user/assistant text turns survive — no client-forged system/tool turns or
 tool_calls (which would be a prompt-injection / fake-result vector)), `sanitizeClientTools` (Validate client-declared browser tools: well-formed names only, capped, and NEVER allowed to shadow a server
 tool (a forged client tool with a server tool's name would otherwise hijack a privileged op into the browser)), `DEFAULT_SYSTEM` (`@suluk/chat` — a contract-driven chat AGENT for any suluk app)
**loop:** `runAgent`, `AgentEvent`, `ClientToolDef` (A browser-executed tool: the model can call it, but the WORKER never runs it — it streams a `client_tool` event
 to the widget, which executes the action (cart, theme, navigation, …) locally)
**openrouter:** `streamCompletion` (One streamed chat completion), `parseSSEStream` (Parse an OpenAI-style SSE completion stream: forward `delta), `toolsToOpenAI` (Map @suluk/mcp tool descriptors to OpenAI/OpenRouter `tools` (function-calling) shape), `ChatMessage`, `ToolCall`, `OpenAITool`
**widget:** `chatWidget`

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)