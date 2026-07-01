[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / resolveSkillModels

# Function: resolveSkillModels()

> **resolveSkillModels**(`doc`, `agentName`, `skillName`, `catalog`, `minWindowRequired?`): [`SelectResult`](../interfaces/SelectResult.md)

Defined in: [agents/src/model-select.ts:67](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/agents/src/model-select.ts#L67)

Run the catalog selector for a skill from its declared NEEDS + the analyzer load.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### agentName

`string`

### skillName

`string`

### catalog

[`ModelCatalog`](../interfaces/ModelCatalog.md)

### minWindowRequired?

`number`

## Returns

[`SelectResult`](../interfaces/SelectResult.md)
