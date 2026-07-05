# C104 — `x-suluk-run`: the per-operation PIPELINE GRAPH as a byproduct of composition, not a competing DAG engine

> **Provenance.** A Suluk *candidate* decision (codename `asl-ojs`), authored by the single contributor, grounded in
> burhan/daftar/mizan — **not** a Moonwalk SIG decision. Operator-driven (2026-07-05), across two turns. First: *"what
> if we add a way to define a 'run' in each operation that is made up of a pipeline that runs other internal or
> external defined ops or generic ops or developer abstracted ops or package imported ops plus DAG, would it be a good
> way to define routes + service interfaces before even writing any code."* Corrected mid-assessment: *"we are the
> same author for all of these pieces, and we authored all of them today as itteration to find the best way to do it,
> dont take my history as a bad precedence"* — the C093/C100 "Gen-1 DAG deleted for zero consumers" history is a
> LESSON (a general runtime composition/branch executor has no real consumer), not a verdict against a data-only
> graph. Then, decisively: *"the DAG compile down to sulukFmt/sulukFmt.all (or a better version) as generated output,
> or gets generated from them — it can be used as both, but we will use it as a durable, re-read source of truth that
> allows us to autogenerate bdd primitives from"* → *"yes, go"*. Extended once more, mid-build: *"To make it
> execution-complete, I would add: Per-node input and output contracts... Transition semantics... Terminal
> semantics... Runtime controls, such as retry policy, timeout, idempotency, and optional compensation edges."*

**Status:** BUILT + VERIFIED. `@suluk/effect` **68/68** tests pass (24 new, covering every behavior below); full
30-package ecosystem sweep — **zero typecheck errors**, every touched package's test suite green (effect 68, hono 81,
core 66, drizzle 60, platform 149). Two PRE-EXISTING, unrelated failures observed (not this session's, out of scope):
`@suluk/admin`'s stale "wrangler deploy" test assertion (predates the C059 de-wrangler migration) and a
drizzle-zod/nano-stores version-mismatch typecheck error in `nano-stores`/`example-petshop`.

## Context

Three prior turns established a shape worth reusing: a companion model lives in ONE place (`core/src/types.ts`, per
the C100 correction), is NON-NORMATIVE (a vendor `x-suluk-*` facet, never read by the D1 matcher), and is PRODUCED as
a byproduct of an existing mechanism rather than hand-authored in parallel with it (C037's `x-suluk-store`, C094's
`x-suluk-scenario`). The load-bearing design constraint for THIS facet, though, is different from those: the operator
explicitly did not want a rebuilt Gen-1. C100's "DSL DIET" ADR deleted `action`/`pipeline`/`chain`/`branch`/
`effectPipeRoute`/`fixedEnvelope` — a general RUNTIME composition/DAG executor — for having **zero real consumers**,
replaced by the simpler `sulukFn` (leaf) / `sulukFmt` (linear compose) / `sulukFmt.all` (fan-out). C093 additionally
removed `deps` from `sulukFn` outright: composition is *exclusively* `sulukFmt`/`sulukFmt.all`, and a leaf never
reaches into another. Confirmed by direct inspection: `mergeSlices` (the merge underneath both combinators) discards
all structural information — a pipeline's own topology is NOT statically readable today, and C094's BDD steps prove
it: `dedupeSteps` only concat-and-dedupes a FLAT bag of Given/When/Then, with no order and no per-node error
attribution. That flat-bag limitation is the concrete gap this ADR closes.

The resolution: a run-pipeline GRAPH that is DATA ONLY, captured as a byproduct of the exact `sulukFmt`/`sulukFmt.all`
calls that already build a pipeline — it cannot drift from the real composition because it IS derived from it, and it
adds no new way to execute anything. This keeps faith with the C100 lesson (no parallel DAG executor) while
delivering what a hand-authored DAG would have promised: a pipeline's shape readable statically from the codebase,
and stub codegen for not-yet-written ops.

## Decision

**The types (`core/src/types.ts`, immediately after `SulukStore`).** `SulukRunNodeKind =
"internal" | "external" | "generic" | "package"`; `SulukRunNode` (`label`, `kind`, advisory `from`, `stub`, `errors`,
`input`/`output` as `SchemaOrRef`, `retry?: {times, delayMs?}`, `timeoutMs?`, `idempotent?`, `compensate?`);
`SulukRunEdge` (`to`, `after: string[]`, advisory `on?: "success" | "error"`, defaults to `"success"`); `SulukRunGraph`
(`nodes`, `edges`, COMPUTED `terminals: string[]` — the node(s) whose output becomes the graph's own result). Every
field is marked, honestly, DECLARED-AND-ENFORCED or DECLARED-ONLY (advisory) — the same treatment `SulukApproval`/
`SulukPolicy` already give elsewhere in this file:

- **DECLARED-AND-ENFORCED** (a real runtime effect): `retry` → `@suluk/effect` wraps the node's run in a genuine
  `Effect.retry(Schedule.recurs(times)` [`∩ Schedule.spaced(delayMs)` if given]`)`. `timeoutMs` → wrapped in a genuine
  `Effect.timeoutFail`, failing with a new typed `TimeoutError` (504) — never a silent hang.
- **DECLARED-ONLY** (advisory, read by an auditor/generator, not executed): `idempotent` (no dedup-key machinery
  exists), `compensate` (no saga/rollback engine invokes it — the same honest boundary `SulukAgent`'s deliberately
  absent `stopCondition` vocabulary already draws), edge `on:"error"` (reserved for a FUTURE conditional-routing
  capability `sulukFmt`/`sulukFmt.all` do not build today — adding a real branch-on-error executor is a deliberately
  separate, not-yet-taken decision, the same C093 boundary that kept exactly two combinators, linear + fan-out, and
  removed a general `branch`).

**The facet.** `["x-suluk-run"]?: SulukRunGraph` on `Request` — absent by default, zero impact on every route that
doesn't opt in.

**`@suluk/effect` produces it, never authors it in parallel.** `sulukFn`'s `def.node` option (label + kind + the
runtime controls) seeds a ONE-node graph (`terminals: [label]`) on that leaf's `slice.runGraph`; a `def.body`/
`ok.schema` present converts via `@suluk/zod`'s `zodToV4` into the node's `input`/`output`. `mergeSlices` merely
UNIONS graphs across a pipeline's slices (nodes deduped by label, edges deduped, `terminals` recomputed) — it has no
sequencing context of its own. `sulukFmt` (linear) additionally WIRES one dependency edge from each stage's terminal
node(s) into the next stage's entry node(s), mirroring its own run loop exactly (`fns[i]` only starts once `fns[i-1]`
resolves). `sulukFmt.all` (fan-out) does NOT wire new edges between branches — they run on the same input, so a
plain union is the correct topology; nested inside a linear stage, the OUTER `sulukFmt` still wires one edge into
each of the fan-out's entry nodes. `sulukRoute` passes the merged graph through onto the derived `RouteContract`
exactly like `store` — and this pass-through is where a real bug was caught mid-build: `EffectRouteSpec` (the
`effectRoute()` input type) never declared a `runGraph` field, so the field was silently dropped before ever reaching
the contract (no excess-property error, because a conditional spread `...(cond ? {a} : {})` bypasses that check) —
fixed by adding `runGraph?: RouteContract["runGraph"]` to the spec and copying it into the built contract, the same
one-line fix `store` already has.

**`ref()` — the placeholder-op primitive.** A named node for something not yet written here (`external`/`generic`/
`package`), composing into `sulukFmt`/`sulukFmt.all` with the identical `[SULUK]`/`slice`/`run` shape as a real
`sulukFn` — so a pipeline's shape is authorable, readable, and feedable to a future stub-generator or `@suluk/journeys`
BEFORE every step is written. No `run` supplied → `stub: true` on the node, and calling it `Effect.die`s (a DEFECT,
correctly never auto-retried by `Effect.retry`, which only acts on the FAILURE channel) — a design-time node, not
something meant to serve traffic. `ref()` takes the same `retry`/`timeoutMs`/`idempotent`/`compensate`/`input`/
`output` options as `sulukFn`'s `node`, so swapping a `ref(...)` call for the real implementation later changes
nothing about the graph or anything composed around it.

**Errors bubble honestly.** A node declaring `timeoutMs` folds the new `TimeoutError` into that fn's own `errors` (and
therefore, via the existing errors-union merge, into the route's documented responses) — a 504 the doc surfaces
rather than a silent runtime-only behavior with no matching contract entry.

## Consequences

- `@suluk/core` gains a fourth companion-shaped facet (small: 4 types, ~15 fields) and stays zero-runtime-dependency;
  `@suluk/effect` gains one real new dependency (`@suluk/zod`, for `zodToV4`) and one new export (`ref`); `@suluk/hono`
  gains the `RouteContract.runGraph` field + one stamp line in `emit.ts`, mirroring `store` exactly.
- **Zero impact on every existing route**: no route in the ecosystem declares a `node` label; `runGraph` stays
  `undefined` all the way up for all of them, so the emitted document, the derived contract, and every existing test
  are byte-identical to before this ADR. Proven by the full 68/68 `@suluk/effect` suite (44 pre-existing + 24 new)
  passing unchanged.
- **The load-bearing invariant, re-affirmed**: this is a DATA projection of the real `sulukFmt`/`sulukFmt.all` calls,
  never a second way to compose or execute a pipeline. `retry`/`timeoutMs` are the only fields that touch runtime
  behavior, and both do so by wrapping the EXISTING `run` with EXISTING Effect combinators — no new executor, no new
  control-flow primitive, nothing resembling the deleted Gen-1 `branch`/`pipeline`/`chain`.
- **Deferred, deliberately**: `@suluk/journeys` consuming `x-suluk-run` for graph-shaped BDD scenarios (multi-step
  ordering, per-node negative `Then`s) — the ORIGINAL motivating "autogenerate BDD primitives" goal, scoped out to
  keep this diff bounded to the primitive itself; a real stub-generator turning `stub: true` nodes into scaffolded
  files; publishing `@suluk/core`/`@suluk/effect`/`@suluk/hono`; the spec mirror (`specification/candidate-v4/
  v4-types.ts`) — `x-suluk-run` is non-normative like `x-suluk-store`/`x-suluk-scenario`, neither of which required a
  meta-schema change, so none is expected here either, but this should be confirmed, not assumed, before the next
  spec-mirror pass.

Pairs with `plan/facts/0run-pipeline-graph.bn`. Builds on C093 (the pure-leaf `sulukFn` boundary), C094 (BDD steps —
the flat-bag limitation this closes), C099–C101 (the core-companion-model shape), C103 (the `HttpStatus`/`TimeoutError`
status vocabulary this reuses for the new 504).
