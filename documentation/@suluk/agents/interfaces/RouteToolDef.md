[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / RouteToolDef

# Interface: RouteToolDef

Defined in: [agents/src/runtime-shared.ts:60](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/agents/src/runtime-shared.ts#L60)

A tool DERIVED from a route's operation — the runtime-agnostic shape every adapter renders its own way.

## Properties

### approval?

> `optional` **approval?**: `object`

Defined in: [agents/src/runtime-shared.ts:68](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/agents/src/runtime-shared.ts#L68)

the HITL gate from x-suluk-approval, when required (projects to e.g. the Agents SDK `needsApproval`).

#### reason?

> `optional` **reason?**: `string`

#### required

> **required**: `true`

***

### description

> **description**: `string`

Defined in: [agents/src/runtime-shared.ts:64](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/agents/src/runtime-shared.ts#L64)

the LLM-facing description (the operation's summary/description; falls through an empty summary).

***

### key

> **key**: `string`

Defined in: [agents/src/runtime-shared.ts:62](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/agents/src/runtime-shared.ts#L62)

the wire-level tool id (the route key).

***

### operationRef

> **operationRef**: `string`

Defined in: [agents/src/runtime-shared.ts:72](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/agents/src/runtime-shared.ts#L72)

the by-name operationRef the tool dispatches to (used in the execute stub).

***

### price?

> `optional` **price?**: [`PaidToolPrice`](PaidToolPrice.md)

Defined in: [agents/src/runtime-shared.ts:70](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/agents/src/runtime-shared.ts#L70)

the x402 paidTool price from x-suluk-cost, when a chargeable cost is declared (DECLARED, never enforced — C026).

***

### schema

> **schema**: [`SchemaOrRef`](../../core/type-aliases/SchemaOrRef.md)

Defined in: [agents/src/runtime-shared.ts:66](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/agents/src/runtime-shared.ts#L66)

the input JSON Schema (the operation's body), fed verbatim to the runtime's tool factory.
