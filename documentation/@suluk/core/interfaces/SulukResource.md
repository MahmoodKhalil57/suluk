[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / SulukResource

# Interface: SulukResource

Defined in: [types.ts:82](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/core/src/types.ts#L82)

A loadable RESOURCE (C036) — a member of the top-level `x-suluk-resources` catalog. Cloudflare's "Agent Skills"
model, in Suluk's contract-first form: an on-demand bundle of content the agent loads only when a task matches, so
a large library does not bloat every prompt. NOT a [SulukSkillRef](SulukSkillRef.md) (which is model-bearing, always-on system
text) — a resource carries NO model and is content-only. Structural; never read by the matcher.

## Indexable

> \[`ext`: `` `x-${string}` ``\]: `unknown`

## Properties

### description

> **description**: `string`

Defined in: [types.ts:84](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/core/src/types.ts#L84)

required, routing-oriented — the catalog-listing text the model sees and selects on (mirrors a CF skill description).

***

### kind

> **kind**: `"instructions"` \| `"reference"` \| `"script"`

Defined in: [types.ts:86](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/core/src/types.ts#L86)

the kind of loadable content: `instructions` (a SKILL.md the agent activates), `reference` (a bundled doc it reads), `script` (a bundled script it can run — CF script execution is EARLY/experimental).

***

### provenance

> **provenance**: `object`

Defined in: [types.ts:88](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/core/src/types.ts#L88)

single source of truth + staleness binding — the catalog/SKILL.md is GENERATED from `source`, hashed to detect drift (the same pointer-not-prose discipline as a skill, C027).

#### contentHash

> **contentHash**: `string`

#### source

> **source**: `string`

#### version?

> `optional` **version?**: `string`

***

### trust?

> `optional` **trust?**: `"author-declared"` \| `"retrieved"`

Defined in: [types.ts:90](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/core/src/types.ts#L90)

author-declared (trusted) vs retrieved (untrusted) — a retrieved resource may NOT escalate scope/provenance (mirrors SulukSkillRef.trust).
