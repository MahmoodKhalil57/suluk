[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / AgentGradeOptions

# Interface: AgentGradeOptions

Defined in: [agents/src/grade.ts:63](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/agents/src/grade.ts#L63)

## Properties

### catalog?

> `optional` **catalog?**: [`ModelCatalog`](ModelCatalog.md)

Defined in: [agents/src/grade.ts:67](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/agents/src/grade.ts#L67)

the @suluk/models catalog — enables the model-fit dimension (window vs estimated peak load).

***

### instructions?

> `optional` **instructions?**: `Record`\<`string`, `string`\>

Defined in: [agents/src/grade.ts:65](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/agents/src/grade.ts#L65)

instruction snapshots keyed `"<agent>/<skill>"` — lets the context analyzer MEASURE instruction load (else lower-bound).

***

### modelWindows?

> `optional` **modelWindows?**: `Record`\<`string`, `number`\>

Defined in: [agents/src/grade.ts:69](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/agents/src/grade.ts#L69)

per-id context-window overrides (tests/pins; takes precedence over the catalog).

***

### served?

> `optional` **served?**: `string`[]

Defined in: [agents/src/grade.ts:71](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/agents/src/grade.ts#L71)

the tools a server actually advertises by default — folds in the over-serve + cold-tail-in-default conformance checks.

***

### snapshots?

> `optional` **snapshots?**: `Record`\<`string`, `string`\>

Defined in: [agents/src/grade.ts:73](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/agents/src/grade.ts#L73)

the CURRENT served instruction snapshot, keyed qualified `"<agent>/<skill>"` (wins) OR bare `"<skill>"` (back-compat) — same dual-accept as `instructions` + `verifyAgentFreshness`; folds in the skill-freshness (drift) check.
