# C106 — `sulukFmt.branch`/`race`/`quorum`: first-class branching, join policies, aggregation, graph I/O

> **Provenance.** A Suluk *candidate* decision (codename `asl-ojs`), authored by the single contributor, grounded in
> burhan/daftar/mizan — **not** a Moonwalk SIG decision. Operator-driven (2026-07-05), extending
> [C104](C104-run-pipeline-graph.md)/[C105](C105-run-graph-workflow-completeness.md) same-day. Operator, quoting
> C105's own ADR text back verbatim: *"It still is not a general conditional workflow engine... you still do not
> have arbitrary branching, rich match/switch semantics, or a fully general control-flow language"* — and asked for
> four concrete additions (a first-class branch mechanism, a first-class join policy, a first-class aggregation/
> result-mapping mechanism, graph-level input/output schemas), supplying a concrete type sketch as a starting point.
> Given the concurrency-correctness stakes of hand-building join-policy primitives Effect has no built-in for,
> a design was drafted, then INDEPENDENTLY VERIFIED (Effect API grounding) and CRITICALLY REVIEWED (concurrency
> correctness + API consistency, two parallel reviewers) before a line of production code was written.

**Status:** BUILT + VERIFIED. `@suluk/effect` **115/115** tests pass (30 new beyond C105's 85, including real
timing-sensitive concurrency tests — slow-success-beats-fast-failure, losers actually interrupted, defects counted
toward quorum/race accounting, eager failure on unreachable quorum). Full 30-package ecosystem sweep: **zero
typecheck errors**, every touched package's suite green — zero regression. Same two pre-existing, unrelated
failures as C104/C105 (untouched, out of scope).

## Context — a real bug found during design, before any production code existed

Effect has no single built-in combinator for either join policy this ADR needed: `Effect.raceAll` races on FIRST
SETTLEMENT (a branch that merely *fails* fast still "wins" over one that later succeeds — wrong for "any");
`Effect.firstSuccessOf` runs its candidates **sequentially**, not concurrently. Both had to be hand-built
(`raceForSuccess`/`raceForQuorum`, via `Deferred` + `Effect.fork` + `Fiber.interruptAll`). A first draft used
`Effect.matchEffect` to observe each branch's outcome — the verification pass found this was a **real, hang-causing
bug**: `matchEffect` only ever sees the plain `Fail`/`E` channel, silently dropping `Die` (a defect) and
`Interrupt`. If the *last* branch needed to settle a race died instead of failing cleanly, the accounting counter
would never reach zero and the whole race would hang forever, leaking the awaiting fiber. The fix — `Effect.exit`
(which converts *every* outcome, Fail/Die/Interrupt alike, into an inspectable `Exit`) — was verified against the
real `effect` package source before being written into `suluk-fn.ts`, and a dedicated regression test (a branch that
`throw`s rather than `Effect.fail`s) locks it in. A second review pass then found three further hangs in the first
corrected draft — `effects = []`, `quorum <= 0`, and `quorum > effects.length` — each fixed with an eager guard
*before* forking anything, rather than relying on a settle-event check that the degenerate case would never visit.

## Decision

**`sulukFmt.branch(cases, discriminator, opts?)`** — real, type-checked conditional routing over a node's *own*
declared cases (`cases` first, so `Cases` resolves before the `discriminator` callback is checked against it — the
reverse order was flagged as inference-hostile during review). All cases must produce the same `Out`; `errors`/
`steps`/`store.invalidates` UNION across cases (every path is *possible*, even though only one runs); `cost` is the
**MAX** across cases, not the sum `sulukFmt`/`sulukFmt.all` use — exactly one case executes per call, so summing
would overstate the real, billed `x-suluk-cost` (a review finding, not part of the original sketch). `opts.label`
adds a synthetic decision node whose `shape` is *computed*, never hand-set, as `"branch"` (it's the source of a
`"branch"` edge into each case) — the wire-level `when` on each such edge is sourced structurally from
`Object.keys(cases)`, never free-form author prose, so it can never independently drift from the real discriminator.

**`sulukFmt.race(effects, opts?)` / `sulukFmt.quorum(effects, quorum, opts?)`** — "any" and "quorum" JOIN POLICIES:
fork every candidate concurrently; `race` resolves on the first SUCCESS (interrupting the rest); `quorum` resolves
once `quorum`-many have succeeded (an array, in completion order; interrupting the rest); both fail eagerly once
their target becomes unreachable. Take a plain **array**, not a keyed `Record` — a review finding: TS does not
actually enforce homogeneous `Out` across `Record` values the way the original sketch assumed, so a `Record` bought
a false type-safety guarantee for these two unkeyed-result combinators (it's the right shape for `branch`, which
genuinely needs per-case keys for the discriminator). `errors`/`cost` UNION/SUM across all candidates (every one
genuinely runs concurrently, unlike `branch`). `opts.label` adds a synthetic `join:{policy}` + `aggregate:{strategy}`
node as the sole terminal.

**`sulukFmt.all(branches, opts?)`** gains the same optional `opts.label` — unchanged default behavior (still
`Effect.all`, still an object merge); labeling adds a `join:{policy:"all"}` + `aggregate:{strategy:"object"}` node,
so a labeled fan-out now gets a defined `resultNode` where an unlabeled one still has none (honest ambiguity,
unchanged).

**Graph-level `roots`/`input`/`output`** — `roots` mirrors `terminals` (the graph's own entry points, recomputed at
every merge choke point, not just once — a review finding: sequential edges retire the *next* stage's root
candidates the same way they retire `prev`'s terminal candidates). `input`/`output` mirror `resultNode`'s own honest
reasoning exactly: present iff unambiguous (`roots.length === 1` / `resultNode` defined), taken from that single
node's own `input`/`output` — never threaded through a separate merge computation, so they can't drift from what
`resultNode`/`roots` already say. `output` is explicitly documented as the pre-`view`-wrap domain shape, matching
the existing node-level caveat (a review finding — the original sketch didn't restate it at the graph level).

**A correctness fix required by adding `"branch"` edges**: `isSuccessEdge` was renamed `isForwardEdge` and extended
to treat `"branch"` as forward-progress topology (like `"success"`) — only `"error"` edges are excluded from
`roots`/`terminals`/`resultNode` computation. Getting this wrong (treating `"branch"` like `"error"`) would have
made every branch case and the decision node itself vanish from entry/terminal computation, a review-flagged
blocking issue caught before it ever shipped.

**Node `shape`** (renamed from the original sketch's `role`, which collided with the pre-existing
`ScenarioStep.role`) is fully COMPUTED — never author-set — derived purely from a node's own `join`/`aggregate`
fields or whether it's the source of a `"branch"` edge, recomputed at every merge exactly like `terminals`.

**Explicitly out of scope, named honestly (not silently dropped):** `aggregate.strategy`'s `"custom-keyed-merge"`
value from the original sketch — dropped; nothing produces it (`all`→`"object"`, `race`→`"first"`,
`quorum`→`"array"`), and an unproduced enum value violates the facet's "absent unless meaningfully declared"
discipline. A `role: "fail"` node classification — dropped; it can't be computed purely from graph structure the way
`"join"`/`"aggregate"`/`"branch"` can, and guessing at it risked the same "hand-set, could drift" problem `shape`
was built to avoid. A `race`/`quorum` loser's own `compensate` firing when it's interrupted mid-flight — does NOT
happen (interruption bypasses the C105 `tapError`-based ledger the same way it bypasses a plain `catchAll`); this is
a deliberate, explicitly-tested boundary, the same honest limitation C105 drew around distributed-saga semantics.

**This ADR explicitly revises C093/C104/C105's "exactly two combinators" framing.** `sulukFmt` (linear) and
`sulukFmt.all` (unconditional fan-out) remain the base pair; `sulukFmt.branch`/`race`/`quorum` are now real,
additional combinators. Each stays narrowly scoped the same way `recover`/`compensate` already are: a real,
type-checked TypeScript function (a discriminator, a merge) supplied by the author at construction time, resolved
to descriptive-only data on the wire-safe facet — never a data-interpreted expression language, never a second
engine reading the graph back to decide what to execute.

## Consequences

- `@suluk/core` gains `SulukRunEdge.on:"branch"`/`.when`, `SulukRunNode.shape`/`.join`/`.aggregate`, and
  `SulukRunGraph.roots`/`.input`/`.output` — all additive/optional.
- **Zero impact on every existing route**: nothing in the ecosystem uses `branch`/`race`/`quorum`/`opts.label`
  outside this package's own tests (the same "confirmed via repo-wide grep" discipline as C105's `compensate`
  change). Proven by the full 115/115 suite (85 pre-existing + 30 new) passing unchanged, plus the 30-package sweep.
- **Every concurrency primitive was verified against the real Effect source before being written**, not assumed —
  the `matchEffect`→`Effect.exit` fix and the three degenerate-case hangs were all caught by independent review
  *before* being shipped, then locked in as regression tests, not discovered after the fact.
- **Deliberately still not built**: a "portable" predicate/expression language, node-to-node symbolic value
  bindings, a general error-routing model beyond a node's own declared cases, or a graph-level result-projection
  rule distinct from `resultNode`/`output`. These are a categorically different, larger undertaking than anything in
  C104–C106 — each of the combinators shipped here still routes through a REAL, type-checked TypeScript function
  the author writes; a JSON-encoded predicate/binding language would instead need a genuine INTERPRETER (evaluating
  `SulukRunPredicate`-shaped data against resolved runtime values), which reopens exactly the drift risk this whole
  primitive has been built, three ADRs running, to avoid — a decision requiring its own deliberate scoping pass, not
  a silent extension of this one.

Pairs with `plan/facts/0run-graph-branch-join-aggregate.bn`. Builds directly on C104/C105 (this session, same day).
