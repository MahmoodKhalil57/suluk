[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / SulukAgent

# Interface: SulukAgent

Defined in: [types.ts:168](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/core/src/types.ts#L168)

A composition agent (C027) — an LLM-orchestrated unit. The map KEY is its stable wire-level identity (the emitted
MCP-tool / OpenRouter-function id; C009 by-name, never by index). It carries NO Request/Response and is NEVER
consulted by the request→operation matcher (D1). `description` is required + routing-oriented (the field the
serving LLM selects on). `routes` are deterministic (a by-name `operationRef` into an existing operation, NO
`model`); `skills` are LLM (a `model` is present). `agents` are by-name sub-agent refs; `maxDepth` is REQUIRED
whenever `agents` is non-empty (a typed LEAF = `maxDepth` 0, `agents` {}), and a cycle-linter rejects name-cycles
at author/install time (JSON-Schema cannot express acyclicity). A child's effective scope is INTERSECTION(child,
caller), never union. Determinism is DECLARED, never schema-enforced.

## Indexable

> \[`ext`: `` `x-${string}` ``\]: `unknown`

any other vendor facet — notably `x-suluk-cost` (an agent/skill boundary's declared cost; PROVISIONAL per C026).

## Properties

### agents?

> `optional` **agents?**: `Record`\<`string`, [`SulukAgentRef`](SulukAgentRef.md)\>

Defined in: [types.ts:178](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/core/src/types.ts#L178)

by-name sub-agent refs (never inline — inlining would fork C009 identity).

***

### contextBudget?

> `optional` **contextBudget?**: `object`

Defined in: [types.ts:186](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/core/src/types.ts#L186)

advisory per-tier context budget (basis: estimate); fail-loud, never silent-zero.

#### basis

> **basis**: `"estimate"`

#### tokens

> **tokens**: `number`

***

### description

> **description**: `string`

Defined in: [types.ts:170](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/core/src/types.ts#L170)

required, routing-oriented — the field the serving LLM selects on (a lint rejects empty/one-word).

***

### maxDepth?

> `optional` **maxDepth?**: `number`

Defined in: [types.ts:182](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/core/src/types.ts#L182)

REQUIRED when `agents` is non-empty (a lint, not the schema): the recursion depth ceiling; a leaf is 0.

***

### resources?

> `optional` **resources?**: `Record`\<`string`, [`SulukResourceRef`](SulukResourceRef.md)\>

Defined in: [types.ts:180](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/core/src/types.ts#L180)

by-name refs into the top-level `x-suluk-resources` catalog (C036) — the loadable, on-demand instructions/references/scripts this agent can ACTIVATE (CF "Agent Skills" alignment; lazy + advisory; resolved at projection, never by the matcher).

***

### routes?

> `optional` **routes?**: `Record`\<`string`, [`SulukRouteRef`](SulukRouteRef.md)\>

Defined in: [types.ts:176](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/core/src/types.ts#L176)

deterministic routes: by-name `$ref`s into EXISTING operations; NO `model` field, ever.

***

### scope?

> `optional` **scope?**: `string`[]

Defined in: [types.ts:172](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/core/src/types.ts#L172)

static resource:action authz; the agent's complete reachable surface is statically enumerable from the document.

***

### skills?

> `optional` **skills?**: `Record`\<`string`, [`SulukSkillRef`](SulukSkillRef.md)\>

Defined in: [types.ts:174](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/core/src/types.ts#L174)

instruction bundles; PRESENCE of `model` is the hard static skill(LLM)-vs-route(deterministic) discriminator.

***

### thinking?

> `optional` **thinking?**: `object`

Defined in: [types.ts:196](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/core/src/types.ts#L196)

THINKING ENVELOPE (C029) — a static cap on WITHIN-agent iteration (reason→tool→reason in the SAME completion,
context accreting), orthogonal to `maxDepth` (which bounds cross-agent nesting depth, a fresh context per hop).
`maxRounds` is REQUIRED when `thinking` is present. DECLARED-not-enforced: it bounds re-entries and is consumed
by the context analyzer (round-accretion) + the linter; it NEVER enforces termination, and is NEVER read by the
matcher. The loop TRAJECTORY (when/why each round stops) stays runtime-opaque (matching Strands / the Claude
Agent SDK / OpenAI Agents). There is deliberately NO stopCondition vocabulary — that would model runtime control
flow a generator could only echo. Absent ⇒ opaque single pass (zero-migration default). Conin's 6-round loop.

#### budget?

> `optional` **budget?**: `object`

##### budget.basis

> **basis**: `"estimate"`

##### budget.tokens

> **tokens**: `number`

#### maxRounds

> **maxRounds**: `number`

***

### trustBoundary?

> `optional` **trustBoundary?**: `"untrusted"`

Defined in: [types.ts:184](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/core/src/types.ts#L184)

marks a tier whose retrieved / lower-tier content may NOT escalate scope or upgrade a figure's provenance.
