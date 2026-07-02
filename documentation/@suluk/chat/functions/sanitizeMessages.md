[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/chat](../README.md) / sanitizeMessages

# Function: sanitizeMessages()

> **sanitizeMessages**(`input`): [`ChatMessage`](../interfaces/ChatMessage.md)[]

Defined in: [chat/src/app.ts:63](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/chat/src/app.ts#L63)

Sanitize client-supplied history: ONLY user/assistant text turns survive — no client-forged system/tool turns or
 tool_calls (which would be a prompt-injection / fake-result vector). Trim to the last MAX_TURNS.

## Parameters

### input

`unknown`

## Returns

[`ChatMessage`](../interfaces/ChatMessage.md)[]
