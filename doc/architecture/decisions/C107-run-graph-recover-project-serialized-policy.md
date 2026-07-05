# C107 — `sulukFmt.recover`, custom projection, and first-class serialized policy fields

> **Provenance.** A Suluk *candidate* decision (codename `asl-ojs`), authored by the single contributor, grounded in
> burhan/daftar/mizan — **not** a Moonwalk SIG decision. Operator-driven (2026-07-05), extending
> [C106](C106-run-graph-branch-join-aggregate.md) same-day. Operator asked for four capabilities framed with a
> concrete `SulukRunPredicate`/`SulukRunValueRef`/`SulukRunBinding`/`SulukRunProjection` sketch — a genuine
> data-interpreted expression language and node-to-node symbolic value bindings. Rather than build that silently,
> the operator was asked directly whether a non-TypeScript consumer (a visual editor, an external generator, a
> non-engineer author) was driving the "portable" requirement. Answer: **no** — the pipelines are TypeScript-authored.
> On that basis, two of the four asks were built as REAL, function-based extensions (no interpreter); the other two
> (predicates, value-ref bindings) stay explicitly out of scope, named honestly below. A follow-up message asked for
> the same four items again PLUS a first-class idempotency/dedupe/result-caching cluster — addressed directly,
> outside this ADR's scope, in the same response that shipped this one (see the session record).

**Status:** BUILT + VERIFIED. `@suluk/effect` **137/137** tests pass (22 new beyond C106's 115). Full 30-package
ecosystem sweep: **zero typecheck errors**, every touched package's suite green — zero regression. Same two
pre-existing, unrelated failures as C104–C106 (untouched, out of scope).

## Decision

**`sulukFmt.recover(pipeline, recoverMap)`** — PIPELINE-WIDE typed error recovery: unlike `sulukFn`'s `node.recover`
(scoped to one node's own declared errors, type-checked against them), this catches a tag raised by ANY step inside
an already-composed `pipeline`. Stays on the same side of the line every C104–C106 primitive already drew:
`recoverMap`'s values are real `SulukFn`s the author writes, each receiving the pipeline's own original input
(mirroring `compensate`'s convention) — never a data-interpreted predicate. Honest limitation, stated plainly: unlike
`node.recover`, the tags are NOT compile-time checked against the pipeline's actual bubbled errors (a composed
pipeline's precise error union isn't tracked at the type level) — an unrecognized tag simply never fires. A
recovered tag is REMOVED from the wrapped pipeline's documented `errors` (it's genuinely handled); a fallback's own
new errors are added. Wires unconditionally (no `opts.label` gate — an earlier draft had one, a real design bug
caught by the test suite itself: the gate governed nothing since there's no synthetic node for a label to name,
unlike `sulukFmt.all`/`race`/`quorum`, which each add one).

**`opts.project` on `sulukFmt.all`/`race`/`quorum`** — a real, author-supplied merge FUNCTION that reshapes a
fan-out's result into anything the author wants, stamped as `aggregate:{strategy:"custom"}` (a legitimately produced
enum value now, unlike C106's placeholder that nothing produced). `ok.schema` is left undocumented when `project` is
given (an arbitrary function's return shape isn't derivable as a zod schema automatically — an honest gap, not a
guess).

**First-class serialized policy fields** (the operator's ask to make already-shipped mechanisms more directly
queryable, not just inferable from scanning `edges`):
- `SulukRunNode.recover?: {errorTag, to}[]` — a node's own recover map, serialized directly on the node.
- `SulukRunGraph.recoverPolicy?: {errorTag, to}[]` — `sulukFmt.recover`'s pipeline-wide policy, serialized at the
  graph level (it has no single owning node).
- `SulukRunNode.aggregateProjection?: Record<string,string> | string` — for `sulukFmt.all`'s default `"object"`
  strategy, COMPUTED (output key → source branch's own node label); for `"custom"`, the author's own optional
  `opts.describe` prose (there is no derivable field↔source mapping for an arbitrary function — this is text, not a
  reference the graph could resolve). Absent for `"array"`/`"first"` (no per-key mapping exists) unless paired with
  `"custom"`.
- `SulukRunEdge.guardDescription?: string` — optional, author-supplied prose on a `"branch"` edge, supplementary to
  the authoritative `when` (the structurally-sourced case key) — never a substitute, never evaluated.

Every one of these is a **redundant, convenience projection of a fact already established elsewhere** (an edge, a
`recover`/`recoverMap`/`project` call) — none of them is a new source of truth, none can disagree with what it's
derived from, and none is read by `@suluk/effect` to decide anything at runtime.

## Consequences

- `@suluk/core` gains 5 additive/optional fields; zero breaking changes.
- **Zero impact on every existing route** — nothing in the ecosystem uses any of C107's new surface outside this
  package's own tests. Proven by the full 137/137 suite (115 pre-existing + 22 new) passing unchanged, plus the
  30-package sweep.
- **A real design bug was caught by the test suite during this pass**: `sulukFmt.recover`'s original `opts.label`
  gate governed nothing (the edges it gated never referenced the label at all) — removed, edges now wire
  unconditionally whenever both the pipeline and a fallback have real graph identity.
- **Explicitly, deliberately still out of scope** (the operator's own four-item list, addressed directly rather than
  silently expanded into): a portable predicate/guard expression language (`SulukRunPredicate`) and node-to-node
  symbolic value bindings (`SulukRunValueRef`/`SulukRunBinding`) — both would require a genuine INTERPRETER
  evaluating data against resolved runtime values, the exact second-execution-model risk C104–C107 have
  consistently avoided; per the operator's own confirmation, there is no non-TypeScript consumer requiring
  portability, so `branch`'s discriminator and `race`/`quorum`/`all`'s `project` functions already deliver the
  equivalent expressive power without an interpreter's correctness surface or drift risk.
- **Also explicitly out of scope, flagged separately as its own decision**: a subsequent, larger ask (idempotency-key
  declaration + an ENFORCED dedupe store with TTL + result-caching keyed by that store) is a categorically different
  kind of feature — it requires a real storage backend (not a pure Effect combinator), has its own distributed-
  systems correctness surface (concurrent-duplicate races, TTL/eviction, cache-key scope), and arguably belongs
  closer to `@suluk/hono`'s existing rate-limit-store pattern than to the `x-suluk-run` graph facet. Not scoped or
  built here; addressed directly in conversation, pending the operator's actual decision on where it should live.

Pairs with `plan/facts/0run-graph-recover-project-serialized-policy.bn`. Builds directly on C104–C106 (this session,
same day).
