[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/chat](../README.md) / sanitizeMessages

# Function: sanitizeMessages()

> **sanitizeMessages**(`input`): [`ChatMessage`](../interfaces/ChatMessage.md)[]

Defined in: [chat/src/app.ts:63](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/chat/src/app.ts#L63)

Sanitize client-supplied history: ONLY user/assistant text turns survive — no client-forged system/tool turns or
 tool_calls (which would be a prompt-injection / fake-result vector). Trim to the last MAX_TURNS.

## Parameters

### input

`unknown`

## Returns

[`ChatMessage`](../interfaces/ChatMessage.md)[]
