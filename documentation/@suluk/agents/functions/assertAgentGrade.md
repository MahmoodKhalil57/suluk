[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / assertAgentGrade

# Function: assertAgentGrade()

> **assertAgentGrade**(`doc`, `agentName`, `min`, `opts?`): [`AgentGradeReport`](../interfaces/AgentGradeReport.md)

Defined in: [agents/src/grade.ts:207](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/agents/src/grade.ts#L207)

CI GATE (the hard incentive, mirrors `@suluk/harden`'s assertGrade): throw if the agent's grade is below `min`.
Returns the report on pass, so a test can additionally assert on it.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### agentName

`string`

### min

[`AgentGrade`](../type-aliases/AgentGrade.md)

### opts?

[`AgentGradeOptions`](../interfaces/AgentGradeOptions.md) = `{}`

## Returns

[`AgentGradeReport`](../interfaces/AgentGradeReport.md)
