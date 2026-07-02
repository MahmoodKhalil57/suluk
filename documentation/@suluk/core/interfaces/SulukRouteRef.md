[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / SulukRouteRef

# Interface: SulukRouteRef

Defined in: [types.ts:258](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/core/src/types.ts#L258)

A deterministic ROUTE within an agent — EXCLUSIVELY a by-name `operationRef` into an EXISTING
paths[*]/webhooks/x-suluk-jobs operation (never an inline re-declaration — inlining forks C009 identity and
strands the operation on a 3.1 downgrade). It has NO `model` field, ever — that absence is the hard static
route-vs-skill discriminator. `guarantee` is DECLARED intent, never schema-enforced (mirrors C026 PROVISIONAL).

## Properties

### guarantee?

> `optional` **guarantee?**: `"same-in-same-out"` \| `"idempotent"` \| `"safe"`

Defined in: [types.ts:262](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/core/src/types.ts#L262)

declared determinism intent (advisory, unverifiable-by-schema); NOT enforced.

***

### operationRef

> **operationRef**: `string`

Defined in: [types.ts:260](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/core/src/types.ts#L260)

a by-name `$ref` into an existing operation (resolve-linted; a dangling ref fails burhan-converge).

***

### scope?

> `optional` **scope?**: `string`[]

Defined in: [types.ts:270](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/core/src/types.ts#L270)

***

### tier?

> `optional` **tier?**: `"resident"` \| `"cold-tail"`

Defined in: [types.ts:269](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/core/src/types.ts#L269)

Static serving partition (C027): `resident` (in the default tool list) vs `cold-tail` (revealed via
`discover_tools` on demand). Absent ⇒ resident. This is what a serving adapter trims to make the cheap/lower
tier carry a SMALLER tool surface — the conditional context reduction the tiering thesis needs (it must be
actively performed by the adapter, never enforced by the schema).
