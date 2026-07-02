[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / NodeAgentArtifacts

# Interface: NodeAgentArtifacts

Defined in: [agents/src/node.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/agents/src/node.ts#L29)

## Properties

### files

> **files**: `Record`\<`string`, `string`\>

Defined in: [agents/src/node.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/agents/src/node.ts#L31)

path → owned source the user writes into their Node/Bun project.

***

### reachableSubAgents

> **reachableSubAgents**: `string`[]

Defined in: [agents/src/node.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/agents/src/node.ts#L33)

reachable sub-agents (NOT scaffolded by this v1 adapter — see Cloudflare's recursive version).
