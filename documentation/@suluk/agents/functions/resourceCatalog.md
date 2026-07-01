[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / resourceCatalog

# Function: resourceCatalog()

> **resourceCatalog**(`doc`, `agentName`): [`CatalogEntry`](../interfaces/CatalogEntry.md)[]

Defined in: [agents/src/resources.ts:40](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/agents/src/resources.ts#L40)

The agent's reachable loadable-resource catalog — its DIRECT `resources` refs resolved against the top-level map
(each sub-agent owns its own catalog, so this is not transitive), sorted by key. Dangling refs are skipped here
(`lintResources` owns that error). This is the listing a projection renders into the system prompt / `SKILL.md` set.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### agentName

`string`

## Returns

[`CatalogEntry`](../interfaces/CatalogEntry.md)[]
