[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / CloudflareAgentOptions

# Interface: CloudflareAgentOptions

Defined in: [agents/src/cloudflare.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/agents/src/cloudflare.ts#L26)

## Properties

### className?

> `optional` **className?**: `string`

Defined in: [agents/src/cloudflare.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/agents/src/cloudflare.ts#L28)

the Durable Object class + binding name (default: PascalCase of the agent name).

***

### instructions?

> `optional` **instructions?**: `Record`\<`string`, `string`\>

Defined in: [agents/src/cloudflare.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/agents/src/cloudflare.ts#L30)

pinned snapshots keyed `"<agent>/<skill>"` (preferred) or bare `"<skill>"`; the primary skill's text is inlined as the system prompt.

***

### mcpUrl?

> `optional` **mcpUrl?**: `string`

Defined in: [agents/src/cloudflare.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/agents/src/cloudflare.ts#L32)

an MCP endpoint the tool `execute` stubs can dispatch to — referenced in a comment, never embedded as a credential.
