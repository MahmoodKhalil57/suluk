[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/chat](../README.md) / ChatMessage

# Interface: ChatMessage

Defined in: [chat/src/openrouter.ts:9](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/chat/src/openrouter.ts#L9)

## Properties

### content?

> `optional` **content?**: `string` \| `null`

Defined in: [chat/src/openrouter.ts:11](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/chat/src/openrouter.ts#L11)

***

### name?

> `optional` **name?**: `string`

Defined in: [chat/src/openrouter.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/chat/src/openrouter.ts#L16)

***

### role

> **role**: `"tool"` \| `"system"` \| `"user"` \| `"assistant"`

Defined in: [chat/src/openrouter.ts:10](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/chat/src/openrouter.ts#L10)

***

### tool\_call\_id?

> `optional` **tool\_call\_id?**: `string`

Defined in: [chat/src/openrouter.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/chat/src/openrouter.ts#L15)

tool-result turns reference the call they answer

***

### tool\_calls?

> `optional` **tool\_calls?**: [`ToolCall`](ToolCall.md)[]

Defined in: [chat/src/openrouter.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/chat/src/openrouter.ts#L13)

assistant turns that call tools
