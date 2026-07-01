[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / NodeAgentArtifacts

# Interface: NodeAgentArtifacts

Defined in: [agents/src/node.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/agents/src/node.ts#L29)

## Properties

### files

> **files**: `Record`\<`string`, `string`\>

Defined in: [agents/src/node.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/agents/src/node.ts#L31)

path → owned source the user writes into their Node/Bun project.

***

### reachableSubAgents

> **reachableSubAgents**: `string`[]

Defined in: [agents/src/node.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/agents/src/node.ts#L33)

reachable sub-agents (NOT scaffolded by this v1 adapter — see Cloudflare's recursive version).
