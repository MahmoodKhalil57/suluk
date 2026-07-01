/**
 * `@suluk/chat` — a contract-driven chat AGENT for any suluk app. The same OpenAPI v4 operations that drive the API,
 * SDK, docs, admin, panel, and MCP server are projected (via @suluk/mcp) into tools an in-page assistant can call;
 * an OpenRouter tool-use loop drives them, with the model chosen by @suluk/models (never hardcoded) and every call
 * executed through the store's own access gate — so the agent can BROWSE and, when the user is permitted, ACT.
 * Ships the server loop (`chatApp`, Hono-mountable SSE) + a theme-aware floating `chatWidget`. Pure pieces
 * (`runAgent`, `parseSSEStream`, `toolsToOpenAI`) are independently testable. CANDIDATE tooling — NOT official OAS.
 */
export { chatApp, DEFAULT_SYSTEM, sanitizeMessages, sanitizeClientTools, type ChatOptions } from "./app";
export { runAgent, type AgentEvent, type RunAgentOptions, type ClientToolDef } from "./loop";
export { streamCompletion, parseSSEStream, toolsToOpenAI, type ChatMessage, type ToolCall, type OpenAITool, type OpenRouterConfig } from "./openrouter";
export { chatWidget, type ChatWidgetOptions } from "./widget";
