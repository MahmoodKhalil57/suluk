# C105 — `x-suluk-run` workflow-completeness: typed recover, automatic compensation, acyclicity, resultNode

> **Provenance.** A Suluk *candidate* decision (codename `asl-ojs`), authored by the single contributor, grounded in
> burhan/daftar/mizan — **not** a Moonwalk SIG decision. Operator-driven (2026-07-05), extending
> [C104](C104-run-pipeline-graph.md) same-day. Operator posed 7 workflow-completeness criteria (sequence, fan-out +
> join, route on success/typed failure, retry + timeout, run declared compensation automatically, one unambiguous
> graph result, stay acyclic and statically lintable) and asked for an assessment. A first assessment framed the
> gaps against the deleted "Gen-1" DAG engine's history; the operator corrected that framing directly — *"ignore
> 'Gen-1', it was an old attempt we should move on, stop lingering"* — so the gaps were re-assessed on their own
> technical merits (drift risk between graph data and real execution, type safety, proportional surface area), via
> a ground-truth pass + three competing design stances + a critical review pass, before the operator chose to build
> the harder capabilities now rather than defer them (*"also design (3)/(5) now, accepting the guess"*).

**Status:** BUILT + VERIFIED. `@suluk/effect` **85/85** tests pass (17 new beyond C104's 68, covering every behavior
below). Full 30-package ecosystem sweep: **zero typecheck errors**, every touched package's suite green (effect 85,
hono 81, core 66, drizzle 60, platform 149) — zero regression. Same two pre-existing, unrelated failures as C104
(the `admin` stale test, the nano-stores/example-petshop drizzle-zod version mismatch) — untouched, out of scope.

## Context — the ground-truth pass

Before designing anything, a dedicated pass re-verified C104's actual behavior against the real code (not the ADR's
prose) for all 7 criteria. Two were already DONE (sequence via `wireSequential`; retry/timeout via
`withNodeControls`'s real `Effect.retry`/`Effect.timeoutFail`). Four were genuine gaps: `on:"error"` was declared but
never produced or read (no typed-failure routing at all); `compensate` was a plain, unvalidated string with zero
runtime behavior; there was no cycle detection or dangling-reference validation anywhere; and a graph's `terminals`
could hold multiple labels with no data connecting them to how the ONE actual response is derived. One finding
changed the priority ordering: **reusing an already-composed `sulukFn` in an inconsistent order (`sulukFmt(B, A)`
where `A` already fed into `B`) already produces a REAL, REPRODUCIBLE cycle today** — `wireSequential`'s
`after: prevTerminals` wiring plus `terminalLabels`'s naive incoming/outgoing check silently returns `terminals: []`
with no error. Verified directly (not just claimed) via a standalone repro before trusting it. This made "stay
acyclic and statically lintable" a live bug-fix, not speculative hardening.

## Decision

**Acyclicity + reference validation (`lintRunGraph`, exported).** A pure function — Kahn's-algorithm cycle
detection across BOTH success and error edges, plus a check that every edge's `to`/`after` and every node's
`compensate` names a real node in the SAME graph — runs automatically inside `mergeGraphs`/`wireSequential` (the two
choke points every graph-construction path already goes through), throwing eagerly at construction time. Also
exported (`@suluk/effect`'s `lintRunGraph`) so an external tool can validate an already-emitted `x-suluk-run` facet
standalone.

**`resultNode` (computed, `core/types.ts`).** `terminals[0]` iff `terminals.length === 1`, else absent — an honest
signal that a multi-terminal graph's actual response is a DERIVED composite (`sulukFmt.all`'s keyed merge), not any
one node's raw output. Computed everywhere `terminals` is computed, so it can never drift from it.

**`recover` — typed-failure routing, scoped to a SINGLE node's own declared errors.** `sulukFn`'s `node` option (and
`ref()`'s `opts`) gains `recover?: Partial<Record<Errs[number]["errorTag"] | "TimeoutError", SulukFn<In, Out, R>>>`
— a fallback fn, keyed by which of THIS node's own declared error tags it fails with, TYPE-CHECKED against `Errs`
(the same generic already constraining `errors`) so an unrecognized tag is a compile error. Compiles to a real
`Effect.catchTags` wrap in `withNodeControls`, applied AFTER `retry` is exhausted (retry handles transient failure;
recover handles "this path is done, take the alternate one" — composing them in that order matches how the two
concepts actually relate). Deliberately narrower than the graph-interpreter design considered and rejected during
review: no cross-graph string-label dispatch, no new control-flow primitive — a node recovering its OWN failure with
its OWN typed fallback, exactly the shape `Effect.catchTags` already provides.

**`compensate` — automatic rollback, scoped to a SINGLE pipeline's own already-succeeded steps.** Changed from a
DECLARED-ONLY string to a live `SulukFn<In, unknown, R>` reference (a **breaking** authoring-API change to a field
zero real routes used outside this package's own tests — confirmed via repo-wide grep before making it). `sulukFmt`
builds a success LEDGER (pushed to right after each step succeeds, so it always reflects exactly what really
completed) and wraps the whole chain in ONE `Effect.tapError` that walks the ledger in REVERSE on any later failure,
invoking each entry's own compensator against the ORIGINAL input that step received; `sulukFmt.all` does the fan-out
analog (each branch's own effect is tapped independently, so whichever branches actually completed get compensated
if the fan-out as a whole fails). A compensator's own failure is swallowed (`Effect.catchAll` → `Effect.void`) —
best-effort, never masks the real failure that triggered rollback. Both are OPT-IN per-pipeline: nothing declares
`compensate` ⇒ the exact pre-C105 loop runs, byte-for-byte, zero overhead.

**The success-path/error-path split (a correctness fix discovered while building this).** Recover/compensate wire
real `"error"` edges now, so `entryLabels`/`terminalLabels` were changed to only consider `"success"` edges — an
error edge must never make an otherwise-terminal node look non-terminal on the path that actually succeeds. A
follow-on subtlety, caught by the test suite itself: a fallback/compensator node that is ONLY ever the target of an
error edge (never touches a success edge) must be EXCLUDED from entry/terminal computation entirely, not merely
"not counted as depended-on" — else it trivially looks like its own isolated root+terminal, misrepresenting the
graph's actual response shape. `errorOnlyTargets` computes and excludes exactly this set.

**A real bug caught by the design itself, not just the tests: `entryLabels(fallbackGraph)[0]` — the multi-node
sub-pipeline simplification.** When a `recover`/`compensate` target is itself a multi-step sub-pipeline (not a bare
leaf), only its FIRST entry label is wired into the edge / stamped as the `compensate` string — documented as a
simplification. The full sub-pipeline still executes for real either way, since composition (not the graph DATA)
drives execution; only the DATA's fidelity for a multi-node compensator is reduced. Deliberately not solved further
here — no real caller has a multi-step compensator yet.

## Consequences

- `@suluk/core` gains `SulukRunEdge.errorTag` and `SulukRunGraph.resultNode` (both additive/optional). `@suluk/effect`
  gains `lintRunGraph`/`NodesAndEdges` as new public exports, and `SulukFn.compensate` as a new (optional) interface
  member.
- **Zero impact on every existing route**: nothing in the ecosystem uses `node.recover`/`node.compensate` outside
  this package's own tests (confirmed via repo-wide grep before and after), and a pipeline with none of the new
  fields runs the IDENTICAL code path as before C105 (`anyCompensate`/`recover` guards short-circuit to the plain
  loops). Proven by the full 85/85 suite (68 pre-existing + 17 new) passing unchanged, plus the 30-package sweep.
- **The one breaking API change** (`node.compensate: string` → `SulukFn<In, unknown, R>`) was verified safe before
  making it: a repo-wide grep confirmed zero real consumers.
- **Deliberately still not built**: conditional routing on anything OTHER than a node's own declared error tags
  (no cross-graph dynamic dispatch); compensation for a partially-completed CONCURRENT fan-out beyond "whichever
  branches' own effects individually completed" (no distributed-saga semantics — retryable compensators, compensation
  ordering across nested fan-outs, etc.); `@suluk/journeys` consuming any of this for BDD generation (still the
  original, not-yet-started motivating goal from C104); the spec mirror (`specification/candidate-v4/v4-types.ts`) —
  still non-normative, so likely no meta-schema change needed, to be confirmed before the next spec-mirror pass.

Pairs with `plan/facts/0run-graph-workflow-completeness.bn`. Builds directly on C104 (this session, same day).
