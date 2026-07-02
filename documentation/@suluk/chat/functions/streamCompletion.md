[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/chat](../README.md) / streamCompletion

# Function: streamCompletion()

> **streamCompletion**(`cfg`, `model`, `messages`, `tools`, `onText`, `signal?`): `Promise`\<[`ChatMessage`](../interfaces/ChatMessage.md)\>

Defined in: [chat/src/openrouter.ts:39](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/chat/src/openrouter.ts#L39)

One streamed chat completion. Forwards assistant text deltas to `onText` as they arrive and returns the FINAL
assistant message (with any accumulated `tool_calls`). Throws on a non-2xx (the loop reports it to the client).

## Parameters

### cfg

[`OpenRouterConfig`](../interfaces/OpenRouterConfig.md)

### model

`string`

### messages

[`ChatMessage`](../interfaces/ChatMessage.md)[]

### tools

[`OpenAITool`](../interfaces/OpenAITool.md)[]

### onText

(`delta`) => `void` \| `Promise`\<`void`\>

### signal?

`AbortSignal`

## Returns

`Promise`\<[`ChatMessage`](../interfaces/ChatMessage.md)\>
