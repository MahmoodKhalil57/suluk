[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / SulukSkillRef

# Interface: SulukSkillRef

Defined in: [types.ts:213](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/core/src/types.ts#L213)

A SKILL within an agent — an instruction bundle (the LLM tier). PRESENCE of `model` is what makes this a skill
(the system-text path) rather than a deterministic route. Skill text is a PROVENANCE POINTER (source URL +
content-hash + version), not inlined mutable prose: the served instructions are the single source of truth and a
projected SKILL.md is GENERATED from it, the content-hash binding making drift tool-detectable and fail-loud.

## Indexable

> \[`ext`: `` `x-${string}` ``\]: `unknown`

## Properties

### model?

> `optional` **model?**: `string`[]

Defined in: [types.ts:219](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/core/src/types.ts#L219)

EXPLICIT model preference list (OpenRouter ids), cheap→capable — the opt-out path. OR declare NEEDS via
`modelProfile`/`modelPrefer`/`modelRequire` and let `@suluk/models` pick the best CURRENT model (a skill
declares what it needs, not a frozen id). Structural-only — never read by the matcher (C027 seam to @suluk/models).

***

### modelPrefer?

> `optional` **modelPrefer?**: `object`

Defined in: [types.ts:223](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/core/src/types.ts#L223)

escape-hatch preference weights (0-3) over the 4 author-facing axes.

#### context?

> `optional` **context?**: `0` \| `1` \| `2` \| `3`

#### cost?

> `optional` **cost?**: `0` \| `1` \| `2` \| `3`

#### intelligence?

> `optional` **intelligence?**: `0` \| `1` \| `2` \| `3`

#### speed?

> `optional` **speed?**: `0` \| `1` \| `2` \| `3`

***

### modelProfile?

> `optional` **modelProfile?**: `"tool-reliable"` \| `"cheap-fast"` \| `"balanced"` \| `"max-reasoning"` \| `"long-context"` \| `"vision"`

Defined in: [types.ts:221](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/core/src/types.ts#L221)

a named selection profile resolved against the model catalog (@suluk/models).

***

### modelRequire?

> `optional` **modelRequire?**: `object`

Defined in: [types.ts:231](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/core/src/types.ts#L231)

explicit hard requirements the author adds (beyond what's derived from the agent + the context analyzer). `zdr`
(C030, verified 2026-06-13): require zero-data-retention serving — enforced at runtime via the router's
`provider:{zdr:true}` (which combines with `openrouter/auto`, confirmed by a live probe), since we have no
per-model ZDR fact to pin against; so a `zdr` skill resolves to the ROUTER, and conflicts with a region/license
operator policy that forces a pin.

#### inputModalities?

> `optional` **inputModalities?**: `string`[]

#### minContext?

> `optional` **minContext?**: `number`

#### needsStructured?

> `optional` **needsStructured?**: `boolean`

#### zdr?

> `optional` **zdr?**: `boolean`

***

### modelResolve?

> `optional` **modelResolve?**: `"pinned"` \| `"router"` \| `"latest"`

Defined in: [types.ts:239](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/core/src/types.ts#L239)

How the model is RESOLVED from the survivor set (C030): `pinned` (default) — a concrete reproducible id; `router`
— delegate the per-request pick to OpenRouter's auto-router fenced by our enumerated survivor allowlist (opt-in,
UNGOVERNED skills only — a governed skill declaring `router` fails loud at contract time); `latest` — a ~-latest
alias (defers the version to request time; NOT reproducible). The switch is governance-gated: an operator-policied
agent force-pins for reproducible, auditable behavior. Author surface only; never read by the matcher.

***

### provenance?

> `optional` **provenance?**: `object`

Defined in: [types.ts:248](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/core/src/types.ts#L248)

single source of truth + staleness binding (SKILL.md is generated from `source`, hashed to detect drift).

#### contentHash

> **contentHash**: `string`

#### source

> **source**: `string`

#### version?

> `optional` **version?**: `string`

***

### scope?

> `optional` **scope?**: `string`[]

Defined in: [types.ts:246](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/core/src/types.ts#L246)

***

### tier?

> `optional` **tier?**: `"resident"` \| `"cold-tail"`

Defined in: [types.ts:241](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/core/src/types.ts#L241)

static serving partition: `resident` (default tools/list) vs `cold-tail` (revealed via discover_tools).

***

### trust?

> `optional` **trust?**: `"author-declared"` \| `"retrieved"`

Defined in: [types.ts:245](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/core/src/types.ts#L245)

author-declared (trusted) vs retrieved (untrusted) content (a retrieved skill may not escalate scope/provenance).

***

### whenToUse?

> `optional` **whenToUse?**: `string`

Defined in: [types.ts:243](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/core/src/types.ts#L243)

routing-oriented precondition prose (runtime-advisory; never a request-value selector — D1).
