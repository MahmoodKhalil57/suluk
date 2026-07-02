[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / AgentLayer

# Interface: AgentLayer

Defined in: [agents/src/pyramid.ts:41](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/agents/src/pyramid.ts#L41)

One agent's row in the pyramid view: where it sits + what it composes + the three static-observability signals.

## Properties

### agent

> **agent**: `string`

Defined in: [agents/src/pyramid.ts:42](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/agents/src/pyramid.ts#L42)

***

### budget?

> `optional` **budget?**: `number`

Defined in: [agents/src/pyramid.ts:60](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/agents/src/pyramid.ts#L60)

the agent's DECLARED `contextBudget.tokens`, if any.

***

### contextTokens?

> `optional` **contextTokens?**: `number`

Defined in: [agents/src/pyramid.ts:58](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/agents/src/pyramid.ts#L58)

estimated default context load (tokens) — `contextReport`.

***

### contextWaste?

> `optional` **contextWaste?**: `object`

Defined in: [agents/src/pyramid.ts:64](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/agents/src/pyramid.ts#L64)

CONTEXT-WASTE WARNING — resident tools the analyzer says should move to cold-tail, and the tokens that frees.

#### moveToColdTail

> **moveToColdTail**: `string`[]

#### wouldSaveTokens

> **wouldSaveTokens**: `number`

***

### cyclic

> **cyclic**: `boolean`

Defined in: [agents/src/pyramid.ts:46](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/agents/src/pyramid.ts#L46)

true ⇒ a reachable sub-agent cycle makes the level unbounded — a defect the cycle-linter / grade fail on.

***

### grade?

> `optional` **grade?**: [`AgentGrade`](../type-aliases/AgentGrade.md)

Defined in: [agents/src/pyramid.ts:55](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/agents/src/pyramid.ts#L55)

HARDENING — `gradeAgent` A–F.

***

### level

> **level**: `number`

Defined in: [agents/src/pyramid.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/agents/src/pyramid.ts#L44)

composition height above the floor; a leaf agent = 1. `-1` ⇒ cyclic (see `cyclic`) so the row stays JSON-safe.

***

### overBudget?

> `optional` **overBudget?**: `boolean`

Defined in: [agents/src/pyramid.ts:62](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/agents/src/pyramid.ts#L62)

TOKEN WARNING — the estimate exceeds the declared budget.

***

### routeCount

> **routeCount**: `number`

Defined in: [agents/src/pyramid.ts:48](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/agents/src/pyramid.ts#L48)

level-0 deterministic capabilities composed directly (the calculators).

***

### shippable?

> `optional` **shippable?**: `boolean`

Defined in: [agents/src/pyramid.ts:56](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/agents/src/pyramid.ts#L56)

***

### skillCount

> **skillCount**: `number`

Defined in: [agents/src/pyramid.ts:50](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/agents/src/pyramid.ts#L50)

model-bearing tiers — the agent's internal AI. `0` ⇒ a deterministic composition agent (closer to the floor).

***

### subAgentCount

> **subAgentCount**: `number`

Defined in: [agents/src/pyramid.ts:52](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/agents/src/pyramid.ts#L52)

higher-layer units composed (by-name sub-agent refs).
