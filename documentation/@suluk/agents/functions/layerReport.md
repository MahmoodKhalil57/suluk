[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / layerReport

# Function: layerReport()

> **layerReport**(`doc`, `opts?`): [`LayerReport`](../interfaces/LayerReport.md)

Defined in: [agents/src/pyramid.ts:84](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/agents/src/pyramid.ts#L84)

Build the whole-document pyramid view. Folds, for every agent: its static LEVEL + composition counts, plus the
three observability signals the operator asked for — hardening (`gradeAgent`), token-budget and context-waste
(`contextReport`). Pure + static. `opts` is the SAME options bag `gradeAgent` takes (instructions / catalog /
modelWindows / served / snapshots); pass what you have and the richer columns fill in, omit it for the structure.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### opts?

[`AgentGradeOptions`](../interfaces/AgentGradeOptions.md) = `{}`

## Returns

[`LayerReport`](../interfaces/LayerReport.md)
