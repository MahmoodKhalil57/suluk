[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / gradeAgent

# Function: gradeAgent()

> **gradeAgent**(`doc`, `agentName`, `opts?`): [`AgentGradeReport`](../interfaces/AgentGradeReport.md)

Defined in: [agents/src/grade.ts:188](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/agents/src/grade.ts#L188)

Grade ONE agent A–F by aggregating the package's existing checks (+ two structure checks). Pure & static by default.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### agentName

`string`

### opts?

[`AgentGradeOptions`](../interfaces/AgentGradeOptions.md) = `{}`

## Returns

[`AgentGradeReport`](../interfaces/AgentGradeReport.md)
