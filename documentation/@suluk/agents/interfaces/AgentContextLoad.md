[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / AgentContextLoad

# Interface: AgentContextLoad

Defined in: [agents/src/context.ts:49](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/agents/src/context.ts#L49)

## Properties

### agent

> **agent**: `string`

Defined in: [agents/src/context.ts:50](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/agents/src/context.ts#L50)

***

### budget?

> `optional` **budget?**: `number`

Defined in: [agents/src/context.ts:68](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/agents/src/context.ts#L68)

***

### coldTailTokens

> **coldTailTokens**: `number`

Defined in: [agents/src/context.ts:56](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/agents/src/context.ts#L56)

***

### instructionsMeasured

> **instructionsMeasured**: `boolean`

Defined in: [agents/src/context.ts:52](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/agents/src/context.ts#L52)

***

### instructionsTokens

> **instructionsTokens**: `number`

Defined in: [agents/src/context.ts:51](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/agents/src/context.ts#L51)

***

### maxRounds?

> `optional` **maxRounds?**: `number`

Defined in: [agents/src/context.ts:62](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/agents/src/context.ts#L62)

within-agent thinking cap (C029), if declared.

***

### minWindowRequired

> **minWindowRequired**: `number`

Defined in: [agents/src/context.ts:60](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/agents/src/context.ts#L60)

the minimum context window a model needs to run this agent (= the multi-round PEAK load).

***

### modelFit

> **modelFit**: [`ModelFit`](ModelFit.md)[]

Defined in: [agents/src/context.ts:67](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/agents/src/context.ts#L67)

which DECLARED models are expected to work (window ≥ load) and which can't hold it.

***

### modelWindow?

> `optional` **modelWindow?**: `number`

Defined in: [agents/src/context.ts:70](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/agents/src/context.ts#L70)

the smallest declared model window (the binding window constraint), if any model is known.

***

### overheadTokens

> **overheadTokens**: `number`

Defined in: [agents/src/context.ts:54](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/agents/src/context.ts#L54)

***

### peakTokens

> **peakTokens**: `number`

Defined in: [agents/src/context.ts:65](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/agents/src/context.ts#L65)

worst-case load accounting for thinking round-accretion (= totalTokens when no thinking). Fit checks use THIS.

***

### residentToolTokens

> **residentToolTokens**: `number`

Defined in: [agents/src/context.ts:53](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/agents/src/context.ts#L53)

***

### subAgentCount

> **subAgentCount**: `number`

Defined in: [agents/src/context.ts:58](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/agents/src/context.ts#L58)

***

### target?

> `optional` **target?**: `number`

Defined in: [agents/src/context.ts:71](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/agents/src/context.ts#L71)

***

### thinkingBudget?

> `optional` **thinkingBudget?**: `number`

Defined in: [agents/src/context.ts:63](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/agents/src/context.ts#L63)

***

### tools

> **tools**: [`ToolContextCost`](ToolContextCost.md)[]

Defined in: [agents/src/context.ts:57](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/agents/src/context.ts#L57)

***

### totalTokens

> **totalTokens**: `number`

Defined in: [agents/src/context.ts:55](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/agents/src/context.ts#L55)

***

### utilization?

> `optional` **utilization?**: `number`

Defined in: [agents/src/context.ts:72](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/agents/src/context.ts#L72)
