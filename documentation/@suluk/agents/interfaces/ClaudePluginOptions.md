[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / ClaudePluginOptions

# Interface: ClaudePluginOptions

Defined in: [agents/src/project.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/agents/src/project.ts#L25)

## Properties

### author?

> `optional` **author?**: `object`

Defined in: [agents/src/project.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/agents/src/project.ts#L32)

#### email?

> `optional` **email?**: `string`

#### name

> **name**: `string`

***

### displayName?

> `optional` **displayName?**: `string`

Defined in: [agents/src/project.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/agents/src/project.ts#L29)

***

### homepage?

> `optional` **homepage?**: `string`

Defined in: [agents/src/project.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/agents/src/project.ts#L30)

***

### instructions?

> `optional` **instructions?**: `Record`\<`string`, `string`\>

Defined in: [agents/src/project.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/agents/src/project.ts#L34)

pinned instruction snapshots, keyed `"<agent>/<skill>"` (preferred, unambiguous) or bare `"<skill>"` (back-compat); a skill without one emits no SKILL.md.

***

### keywords?

> `optional` **keywords?**: `string`[]

Defined in: [agents/src/project.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/agents/src/project.ts#L31)

***

### mcpUrl

> **mcpUrl**: `string`

Defined in: [agents/src/project.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/agents/src/project.ts#L27)

the HTTP MCP endpoint the plugin connects to (e.g. https://host/mcp).

***

### version?

> `optional` **version?**: `string`

Defined in: [agents/src/project.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/agents/src/project.ts#L28)
