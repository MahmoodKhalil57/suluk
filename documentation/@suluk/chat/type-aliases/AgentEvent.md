[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/chat](../README.md) / AgentEvent

# Type Alias: AgentEvent

> **AgentEvent** = \{ `n`: `number`; `type`: `"step"`; \} \| \{ `delta`: `string`; `type`: `"text"`; \} \| \{ `name`: `string`; `ok?`: `boolean`; `phase`: `"start"` \| `"end"`; `type`: `"tool"`; \} \| \{ `args`: `Record`\<`string`, `unknown`\>; `name`: `string`; `type`: `"client_tool"`; \} \| \{ `reason`: `"stop"` \| `"max-steps"`; `type`: `"done"`; \} \| \{ `message`: `string`; `type`: `"error"`; \}

Defined in: [chat/src/loop.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/chat/src/loop.ts#L16)
