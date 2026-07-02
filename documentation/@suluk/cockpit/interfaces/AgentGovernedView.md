[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / AgentGovernedView

# Interface: AgentGovernedView

Defined in: [cockpit/src/agents.ts:56](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cockpit/src/agents.ts#L56)

The agent-declared vs operator-effective diff + the cost three-number (cap / estimate / actual). Read-only.

## Properties

### cost

> **cost**: `object`

Defined in: [cockpit/src/agents.ts:64](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cockpit/src/agents.ts#L64)

the three distinct owners: cap (operator x-suluk-policy, enforced-by-adapter) / estimate (author) / actual (C026 runtime).

#### actual

> **actual**: `string`

#### cap

> **cap**: `string` \| `null`

#### estimate

> **estimate**: `string` \| `null`

***

### deniedSubAgents

> **deniedSubAgents**: `string`[]

Defined in: [cockpit/src/agents.ts:61](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cockpit/src/agents.ts#L61)

***

### deniedTools

> **deniedTools**: `string`[]

Defined in: [cockpit/src/agents.ts:60](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cockpit/src/agents.ts#L60)

***

### effectiveMaxDepth?

> `optional` **effectiveMaxDepth?**: `number`

Defined in: [cockpit/src/agents.ts:58](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cockpit/src/agents.ts#L58)

***

### effectiveScope

> **effectiveScope**: [`Scope`](../../agents/type-aliases/Scope.md)

Defined in: [cockpit/src/agents.ts:57](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cockpit/src/agents.ts#L57)

***

### narrowings

> **narrowings**: `object`[]

Defined in: [cockpit/src/agents.ts:62](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cockpit/src/agents.ts#L62)

#### axis

> **axis**: `string`

#### detail

> **detail**: `string`

***

### nestingForbidden

> **nestingForbidden**: `boolean`

Defined in: [cockpit/src/agents.ts:59](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cockpit/src/agents.ts#L59)
