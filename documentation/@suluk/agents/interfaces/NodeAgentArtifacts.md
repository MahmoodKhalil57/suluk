[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / NodeAgentArtifacts

# Interface: NodeAgentArtifacts

Defined in: [agents/src/node.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/node.ts#L29)

## Properties

### files

> **files**: `Record`\<`string`, `string`\>

Defined in: [agents/src/node.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/node.ts#L31)

path → owned source the user writes into their Node/Bun project.

***

### reachableSubAgents

> **reachableSubAgents**: `string`[]

Defined in: [agents/src/node.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/node.ts#L33)

reachable sub-agents (NOT scaffolded by this v1 adapter — see Cloudflare's recursive version).
