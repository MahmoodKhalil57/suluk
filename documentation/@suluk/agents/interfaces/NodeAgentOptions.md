[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / NodeAgentOptions

# Interface: NodeAgentOptions

Defined in: [agents/src/node.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/agents/src/node.ts#L18)

## Properties

### instructions?

> `optional` **instructions?**: `Record`\<`string`, `string`\>

Defined in: [agents/src/node.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/agents/src/node.ts#L22)

pinned snapshots keyed `"<agent>/<skill>"` (preferred) or bare `"<skill>"`; the primary skill's text is the system prompt.

***

### mcpUrl?

> `optional` **mcpUrl?**: `string`

Defined in: [agents/src/node.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/agents/src/node.ts#L24)

an MCP endpoint the tool `execute` stubs can dispatch to — referenced in a comment, never embedded as a credential.

***

### name?

> `optional` **name?**: `string`

Defined in: [agents/src/node.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/agents/src/node.ts#L20)

the exported server/agent name (default: PascalCase of the agent name). Used only in a comment + the file name.

***

### port?

> `optional` **port?**: `number`

Defined in: [agents/src/node.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/agents/src/node.ts#L26)

the port the generated `Bun.serve` listens on (default 8787).
