[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/chat](../README.md) / parseSSEStream

# Function: parseSSEStream()

> **parseSSEStream**(`body`, `onText`): `Promise`\<[`ChatMessage`](../interfaces/ChatMessage.md)\>

Defined in: [chat/src/openrouter.ts:63](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/chat/src/openrouter.ts#L63)

Parse an OpenAI-style SSE completion stream: forward `delta.content`, accumulate `delta.tool_calls` by index.

## Parameters

### body

`ReadableStream`\<`Uint8Array`\<`ArrayBufferLike`\>\>

### onText

(`delta`) => `void` \| `Promise`\<`void`\>

## Returns

`Promise`\<[`ChatMessage`](../interfaces/ChatMessage.md)\>
