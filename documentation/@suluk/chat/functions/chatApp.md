[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/chat](../README.md) / chatApp

# Function: chatApp()

> **chatApp**(`opts`): `Hono`

Defined in: [chat/src/app.ts:116](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/chat/src/app.ts#L116)

`@suluk/chat` — a contract-driven chat AGENT for any suluk app. The same OpenAPI v4 operations that drive the API,
SDK, docs, admin, panel, and MCP server are projected (via @suluk/mcp) into tools an in-page assistant can call;
an OpenRouter tool-use loop drives them, with the model chosen by @suluk/models (never hardcoded) and every call
executed through the store's own access gate — so the agent can BROWSE and, when the user is permitted, ACT.
Ships the server loop (`chatApp`, Hono-mountable SSE) + a theme-aware floating `chatWidget`. Pure pieces
(`runAgent`, `parseSSEStream`, `toolsToOpenAI`) are independently testable. CANDIDATE tooling — NOT official OAS.

## Parameters

### opts

[`ChatOptions`](../interfaces/ChatOptions.md)

## Returns

`Hono`
