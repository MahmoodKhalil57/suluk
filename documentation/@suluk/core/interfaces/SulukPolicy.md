[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / SulukPolicy

# Interface: SulukPolicy

Defined in: [types.ts:280](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L280)

An OPERATOR governance policy (C028) — a member of the `x-suluk-policy` map, keyed by operator/fleet name. Every
field is STATIC, locally decidable, and NARROW-ONLY: applying a policy can only REMOVE capability an agent
self-declared (effective = INTERSECT(policy, agent)), never grant. No field may reference request/DOM/header/body
values (D1; the #20 tripwire is declined here too). `appliesTo` binds BY AGENT NAME (`#/x-suluk-agents/<key>`).

## Indexable

> \[`ext`: `` `x-${string}` ``\]: `unknown`

## Properties

### agents?

> `optional` **agents?**: `object`

Defined in: [types.ts:286](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L286)

deny/allow sub-agent keys (an allow-list, when present, is the only permitted set).

#### allow?

> `optional` **allow?**: `string`[]

#### deny?

> `optional` **deny?**: `string`[]

***

### appliesTo?

> `optional` **appliesTo?**: `string`[]

Defined in: [types.ts:282](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L282)

by-name refs into x-suluk-agents keys this policy governs (NEVER a request predicate). Empty/absent ⇒ all agents.

***

### capTier?

> `optional` **capTier?**: `"resident"` \| `"cold-tail"`

Defined in: [types.ts:292](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L292)

pin the MAX tier — a cold-tail skill under `capTier: resident` is downgraded (and flagged).

***

### costCeiling?

> `optional` **costCeiling?**: `object`

Defined in: [types.ts:305](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L305)

The operator's DECLARED cost cap — the third of cap/estimate/actual (estimate = the agent's own x-suluk-cost,
actual = the C026 reconciled charge). The SCHEMA DECLARES this number; it does NOT enforce it — `enforcedBy`
names who does (a runtime admission-gate / adapter). Required so a reader can never mistake declaration for
enforcement (C026 PROVISIONAL honesty).

#### amount

> **amount**: `number`

#### amountUnit

> **amountUnit**: `"micro-usd"` \| `"cents"` \| `"usd"`

#### basis?

> `optional` **basis?**: `string`

#### enforcedBy

> **enforcedBy**: `"adapter"` \| `"runtime"`

***

### forbidNesting?

> `optional` **forbidNesting?**: `boolean`

Defined in: [types.ts:298](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L298)

forbid sub-agents entirely (⇒ effective maxDepth 0).

***

### maxDepthCap?

> `optional` **maxDepthCap?**: `number`

Defined in: [types.ts:296](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L296)

an upper bound on recursion depth — effective maxDepth = min(agent.maxDepth, maxDepthCap).

***

### modelAllowlist?

> `optional` **modelAllowlist?**: `string`[]

Defined in: [types.ts:294](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L294)

the only model ids permitted — effective skill model[] = INTERSECT(skill.model, modelAllowlist).

***

### retrievalTools?

> `optional` **retrievalTools?**: `object`

Defined in: [types.ts:290](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L290)

deny/allow the retrieval/untrusted tier's tools specifically (its non-deterministic blast radius).

#### allow?

> `optional` **allow?**: `string`[]

#### deny?

> `optional` **deny?**: `string`[]

***

### scopeAllowlist?

> `optional` **scopeAllowlist?**: `string`[]

Defined in: [types.ts:284](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L284)

operator's max scope ceiling — effective agent scope = INTERSECT(agent.scope, scopeAllowlist).

***

### tools?

> `optional` **tools?**: `object`

Defined in: [types.ts:288](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L288)

deny/allow route (tool) keys.

#### allow?

> `optional` **allow?**: `string`[]

#### deny?

> `optional` **deny?**: `string`[]
