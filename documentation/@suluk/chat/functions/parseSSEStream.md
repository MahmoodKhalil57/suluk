[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/chat](../README.md) / parseSSEStream

# Function: parseSSEStream()

> **parseSSEStream**(`body`, `onText`): `Promise`\<[`ChatMessage`](../interfaces/ChatMessage.md)\>

Defined in: [chat/src/openrouter.ts:63](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/chat/src/openrouter.ts#L63)

Parse an OpenAI-style SSE completion stream: forward `delta.content`, accumulate `delta.tool_calls` by index.

## Parameters

### body

`ReadableStream`\<`Uint8Array`\<`ArrayBufferLike`\>\>

### onText

(`delta`) => `void` \| `Promise`\<`void`\>

## Returns

`Promise`\<[`ChatMessage`](../interfaces/ChatMessage.md)\>
