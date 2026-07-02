[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/chat](../README.md) / RunAgentOptions

# Interface: RunAgentOptions

Defined in: [chat/src/loop.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/chat/src/loop.ts#L24)

## Properties

### clientTools?

> `optional` **clientTools?**: [`ClientToolDef`](ClientToolDef.md)[]

Defined in: [chat/src/loop.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/chat/src/loop.ts#L29)

Browser-executed tool definitions (no handler) — surfaced to the model, dispatched to the widget by name.

***

### complete

> **complete**: (`messages`, `tools`, `onText`) => `Promise`\<[`ChatMessage`](ChatMessage.md)\>

Defined in: [chat/src/loop.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/chat/src/loop.ts#L33)

One streamed model completion: stream text via onText, resolve to the final assistant message.

#### Parameters

##### messages

[`ChatMessage`](ChatMessage.md)[]

##### tools

[`OpenAITool`](OpenAITool.md)[]

##### onText

(`d`) => `void` \| `Promise`\<`void`\>

#### Returns

`Promise`\<[`ChatMessage`](ChatMessage.md)\>

***

### exec

> **exec**: (`op`, `args`) => `Promise`\<`unknown`\>

Defined in: [chat/src/loop.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/chat/src/loop.ts#L31)

Execute a SERVER tool call against the store (e.g. appExec bound to the request).

#### Parameters

##### op

[`McpOp`](../../mcp/interfaces/McpOp.md)

##### args

`Record`\<`string`, `unknown`\>

#### Returns

`Promise`\<`unknown`\>

***

### maxResultChars?

> `optional` **maxResultChars?**: `number`

Defined in: [chat/src/loop.ts:38](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/chat/src/loop.ts#L38)

cap each tool result's serialized length fed back to the model (default 8000 chars).

***

### maxSteps?

> `optional` **maxSteps?**: `number`

Defined in: [chat/src/loop.ts:36](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/chat/src/loop.ts#L36)

max model round-trips before forcing a stop (default 6).

***

### messages

> **messages**: [`ChatMessage`](ChatMessage.md)[]

Defined in: [chat/src/loop.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/chat/src/loop.ts#L26)

Conversation so far (user/assistant turns); the system prompt is prepended from `system`.

***

### system?

> `optional` **system?**: `string`

Defined in: [chat/src/loop.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/chat/src/loop.ts#L34)

***

### tools

> **tools**: [`McpTool`](../../mcp/interfaces/McpTool.md)[]

Defined in: [chat/src/loop.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/chat/src/loop.ts#L27)
