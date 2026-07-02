[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / gradeAgents

# Function: gradeAgents()

> **gradeAgents**(`doc`, `opts?`): [`AgentGradeReport`](../interfaces/AgentGradeReport.md)[]

Defined in: [agents/src/grade.ts:194](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/agents/src/grade.ts#L194)

Grade EVERY agent in the document (weakest first) — the rollup. Computes the whole-doc passes ONCE (not per agent).

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### opts?

[`AgentGradeOptions`](../interfaces/AgentGradeOptions.md) = `{}`

## Returns

[`AgentGradeReport`](../interfaces/AgentGradeReport.md)[]
