[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / AgentNodeView

# Interface: AgentNodeView

Defined in: [cockpit/src/agents.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/cockpit/src/agents.ts#L32)

## Properties

### context

> **context**: [`AgentContextLoad`](../../agents/interfaces/AgentContextLoad.md)

Defined in: [cockpit/src/agents.ts:50](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/cockpit/src/agents.ts#L50)

estimated default context load (resident instructions+tools+overhead) vs budget/window — the unflatten check (C027).

***

### description

> **description**: `string`

Defined in: [cockpit/src/agents.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/cockpit/src/agents.ts#L34)

***

### effectiveScope

> **effectiveScope**: [`Scope`](../../agents/type-aliases/Scope.md)

Defined in: [cockpit/src/agents.ts:39](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/cockpit/src/agents.ts#L39)

scope after INTERSECTION along the reaching path (null = unconstrained).

***

### governed?

> `optional` **governed?**: [`AgentGovernedView`](AgentGovernedView.md)

Defined in: [cockpit/src/agents.ts:48](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/cockpit/src/agents.ts#L48)

operator governance diff (C028) — present only when an x-suluk-policy governs this agent.

***

### kind

> **kind**: `"orchestrator"` \| `"leaf"`

Defined in: [cockpit/src/agents.ts:36](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/cockpit/src/agents.ts#L36)

an orchestrator has sub-agents; a leaf does not (the recursion base case).

***

### maxDepth?

> `optional` **maxDepth?**: `number`

Defined in: [cockpit/src/agents.ts:37](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/cockpit/src/agents.ts#L37)

***

### modelSelection?

> `optional` **modelSelection?**: `object`[]

Defined in: [cockpit/src/agents.ts:53](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/cockpit/src/agents.ts#L53)

per-skill model pick (C027 × @suluk/models) — present only when agentsView is given a catalog. OBSERVE-only:
"why this model" (declared vs selected, top ids, deciding preference, UNKNOWN-coverage gaps). Never executes.

#### coverageGaps?

> `optional` **coverageGaps?**: `string`[]

#### decidingPreference?

> `optional` **decidingPreference?**: `string`

#### error?

> `optional` **error?**: `string`

#### from?

> `optional` **from?**: `"declared"` \| `"selected"`

#### ids?

> `optional` **ids?**: `string`[]

#### pickPinned?

> `optional` **pickPinned?**: `boolean`

#### resolve?

> `optional` **resolve?**: `"pinned"` \| `"router"` \| `"latest"`

#### skill

> **skill**: `string`

***

### name

> **name**: `string`

Defined in: [cockpit/src/agents.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/cockpit/src/agents.ts#L33)

***

### projection

> **projection**: `object`

Defined in: [cockpit/src/agents.ts:46](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/cockpit/src/agents.ts#L46)

OBSERVE-only preview of what projection WOULD emit — names, never executed, never credentialed.

#### discoverableTools

> **discoverableTools**: `string`[]

#### openRouterTools

> **openRouterTools**: `string`[]

#### pluginFiles

> **pluginFiles**: `string`[]

#### residentTools

> **residentTools**: `string`[]

***

### reachable

> **reachable**: `object`

Defined in: [cockpit/src/agents.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/cockpit/src/agents.ts#L44)

worst-case statically-enumerable reach (tools + transitively-reachable sub-agents).

#### agents

> **agents**: `string`[]

#### tools

> **tools**: `string`[]

***

### routes

> **routes**: [`AgentRouteView`](AgentRouteView.md)[]

Defined in: [cockpit/src/agents.ts:41](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/cockpit/src/agents.ts#L41)

***

### skills

> **skills**: [`AgentSkillView`](AgentSkillView.md)[]

Defined in: [cockpit/src/agents.ts:40](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/cockpit/src/agents.ts#L40)

***

### subAgents

> **subAgents**: `string`[]

Defined in: [cockpit/src/agents.ts:42](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/cockpit/src/agents.ts#L42)
