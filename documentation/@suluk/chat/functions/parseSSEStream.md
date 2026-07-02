[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/chat](../README.md) / parseSSEStream

# Function: parseSSEStream()

> **parseSSEStream**(`body`, `onText`): `Promise`\<[`ChatMessage`](../interfaces/ChatMessage.md)\>

Defined in: [chat/src/openrouter.ts:63](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/chat/src/openrouter.ts#L63)

Parse an OpenAI-style SSE completion stream: forward `delta.content`, accumulate `delta.tool_calls` by index.

## Parameters

### body

`ReadableStream`\<`Uint8Array`\<`ArrayBufferLike`\>\>

### onText

(`delta`) => `void` \| `Promise`\<`void`\>

## Returns

`Promise`\<[`ChatMessage`](../interfaces/ChatMessage.md)\>
