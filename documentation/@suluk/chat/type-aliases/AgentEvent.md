[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/chat](../README.md) / AgentEvent

# Type Alias: AgentEvent

> **AgentEvent** = \{ `n`: `number`; `type`: `"step"`; \} \| \{ `delta`: `string`; `type`: `"text"`; \} \| \{ `name`: `string`; `ok?`: `boolean`; `phase`: `"start"` \| `"end"`; `type`: `"tool"`; \} \| \{ `args`: `Record`\<`string`, `unknown`\>; `name`: `string`; `type`: `"client_tool"`; \} \| \{ `reason`: `"stop"` \| `"max-steps"`; `type`: `"done"`; \} \| \{ `message`: `string`; `type`: `"error"`; \}

Defined in: [chat/src/loop.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/chat/src/loop.ts#L16)
