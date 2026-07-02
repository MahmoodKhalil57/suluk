[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / AgentsView

# Interface: AgentsView

Defined in: [cockpit/src/agents.ts:66](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/cockpit/src/agents.ts#L66)

## Properties

### agents

> **agents**: [`AgentNodeView`](AgentNodeView.md)[]

Defined in: [cockpit/src/agents.ts:68](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/cockpit/src/agents.ts#L68)

***

### contextFindings

> **contextFindings**: [`LintFinding`](../../agents/interfaces/LintFinding.md)[]

Defined in: [cockpit/src/agents.ts:75](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/cockpit/src/agents.ts#L75)

context-budget findings (model-fit / over-budget / overloaded / empty-layer / passthrough / flattenable) — the right-sizing check.

***

### findings

> **findings**: [`LintFinding`](../../agents/interfaces/LintFinding.md)[]

Defined in: [cockpit/src/agents.ts:71](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/cockpit/src/agents.ts#L71)

***

### flatten

> **flatten**: [`FlattenSuggestion`](../../agents/interfaces/FlattenSuggestion.md)[]

Defined in: [cockpit/src/agents.ts:79](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/cockpit/src/agents.ts#L79)

for every thin/redundant layer: what to collapse up (the dual — merge UP).

***

### installable

> **installable**: `boolean`

Defined in: [cockpit/src/agents.ts:73](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/cockpit/src/agents.ts#L73)

true ⇒ no error-severity findings across the whole map (the gate).

***

### present

> **present**: `boolean`

Defined in: [cockpit/src/agents.ts:67](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/cockpit/src/agents.ts#L67)

***

### roots

> **roots**: `string`[]

Defined in: [cockpit/src/agents.ts:70](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/cockpit/src/agents.ts#L70)

entry-point agents — not referenced as a sub-agent by any other agent.

***

### unflatten

> **unflatten**: [`UnflattenSuggestion`](../../agents/interfaces/UnflattenSuggestion.md)[]

Defined in: [cockpit/src/agents.ts:77](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/cockpit/src/agents.ts#L77)

for every over-target agent: what to move to cold-tail or extract into a sub-agent (split DOWN).
