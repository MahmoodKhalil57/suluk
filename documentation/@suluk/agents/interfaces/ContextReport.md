[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / ContextReport

# Interface: ContextReport

Defined in: [agents/src/context.ts:95](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/agents/src/context.ts#L95)

## Properties

### findings

> **findings**: [`LintFinding`](LintFinding.md)[]

Defined in: [agents/src/context.ts:97](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/agents/src/context.ts#L97)

***

### flatten

> **flatten**: [`FlattenSuggestion`](FlattenSuggestion.md)[]

Defined in: [agents/src/context.ts:101](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/agents/src/context.ts#L101)

flatten suggestions for thin/redundant layers (collapse UP).

***

### loads

> **loads**: [`AgentContextLoad`](AgentContextLoad.md)[]

Defined in: [agents/src/context.ts:96](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/agents/src/context.ts#L96)

***

### suggestions

> **suggestions**: [`UnflattenSuggestion`](UnflattenSuggestion.md)[]

Defined in: [agents/src/context.ts:99](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/agents/src/context.ts#L99)

unflatten suggestions for over-target agents (split DOWN).
