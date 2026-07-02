[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / skillModels

# Function: skillModels()

> **skillModels**(`doc`, `agentName`, `skillName`, `catalog`, `minWindowRequired?`): [`SkillModelResolution`](../interfaces/SkillModelResolution.md)

Defined in: [agents/src/model-select.ts:85](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/agents/src/model-select.ts#L85)

The public seam: the models for a skill — its DECLARED list (opt-out) or the catalog-SELECTED ranked ids, resolved
to a runtime TARGET (pin / router / latest) under the C030 governance gate.

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

[`SkillModelResolution`](../interfaces/SkillModelResolution.md)
