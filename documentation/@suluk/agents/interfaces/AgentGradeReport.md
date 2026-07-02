[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / AgentGradeReport

# Interface: AgentGradeReport

Defined in: [agents/src/grade.ts:46](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/grade.ts#L46)

## Properties

### agent

> **agent**: `string`

Defined in: [agents/src/grade.ts:47](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/grade.ts#L47)

***

### byDimension

> **byDimension**: `Record`\<[`GradeDimension`](../type-aliases/GradeDimension.md), [`AgentGradeFinding`](AgentGradeFinding.md)[]\>

Defined in: [agents/src/grade.ts:58](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/grade.ts#L58)

***

### bySeverity

> **bySeverity**: `Record`\<[`GradeSeverity`](../type-aliases/GradeSeverity.md), `number`\>

Defined in: [agents/src/grade.ts:57](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/grade.ts#L57)

***

### findings

> **findings**: [`AgentGradeFinding`](AgentGradeFinding.md)[]

Defined in: [agents/src/grade.ts:56](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/grade.ts#L56)

***

### grade

> **grade**: [`AgentGrade`](../type-aliases/AgentGrade.md)

Defined in: [agents/src/grade.ts:49](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/grade.ts#L49)

***

### score

> **score**: `number`

Defined in: [agents/src/grade.ts:48](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/grade.ts#L48)

***

### shippable

> **shippable**: `boolean`

Defined in: [agents/src/grade.ts:55](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/grade.ts#L55)

false ⇒ at least one ship-blocking ERROR-severity finding (ANY dimension) — the grade is then capped at F.
NB this is broader than lint-installability: an agent that installs perfectly but is SERVED wrong (over-serve /
cold-tail-in-default) or whose preprompt DRIFTED (stale-skill) is also not shippable. `grade === "F" ⟺ !shippable`.

***

### suggestions

> **suggestions**: [`UnflattenSuggestion`](UnflattenSuggestion.md)[]

Defined in: [agents/src/grade.ts:60](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/grade.ts#L60)

the existing inverse-fix pointers for the context dimension (which resident tools to push to cold-tail).
