[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / agentManifest

# Function: agentManifest()

> **agentManifest**(`doc`, `agentName`, `opts?`): [`AgentManifest`](../interfaces/AgentManifest.md)

Defined in: [agents/src/manifest.ts:73](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/agents/src/manifest.ts#L73)

Build the canonical, signable manifest for an agent and its reachable sub-tree. Pure; does not throw.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### agentName

`string`

### opts?

#### catalog?

[`ModelCatalog`](../interfaces/ModelCatalog.md)

## Returns

[`AgentManifest`](../interfaces/AgentManifest.md)
