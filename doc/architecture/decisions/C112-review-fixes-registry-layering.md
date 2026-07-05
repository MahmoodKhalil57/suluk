# C112 — pre-publish review: 5 confirmed correctness bugs fixed; registry import-layering enforced

> **Provenance.** A Suluk *candidate* decision (codename `asl-ojs`), authored by the single contributor, grounded in
> burhan/daftar/mizan — **not** a Moonwalk SIG decision. Operator-driven (2026-07-05): *"review uncommitted changes
> so we can bump everything and commit and push, then use in todo registry with autotoolfactory."* Before any
> version bump/publish, ran a full 8-angle code review (line-by-line, removed-behavior, cross-file, reuse,
> simplification, efficiency, altitude, conventions) over the ENTIRE uncommitted diff (C099–C111, ~101 files) via
> independent Agent-tool finder passes, then a 1-vote recall-biased verifier per surviving candidate. Mid-review,
> the operator also stated a registry import-layering rule (routes→services→models) which surfaced a real,
> pre-existing violation, fixed here too.

**Status:** BUILT + VERIFIED. All 5 verified candidates were **CONFIRMED** (4 real runtime-correctness bugs + 1
graph-facet accuracy bug) and are now fixed, each with a new regression test. Full 30-package ecosystem sweep after
fixes: **1969 tests pass, zero fail, zero typecheck errors**. Conformance harness 8/8.

## The 5 confirmed, fixed findings

1. **`enforceDedupe` permanently cached a 5xx from an unhandled defect** (`@suluk/hono`, `dedupe.ts`). `effectRoute`
   renders even an undeclared crash as a plain `Response` (never a thrown exception), so the middleware's
   `catch`/`release` path never ran — `store.complete()` was called unconditionally on ANY status, caching a
   transient failure for the whole `ttlMs` and permanently denying every retry with the same idempotency key.
   **Fix**: only cache/replay `status < 500`; a 5xx now `release()`s the reservation so a genuine retry reaches the
   handler again. New test: a handler that fails once then succeeds proves the second identical-key request is
   NOT a replay and really re-ran.
2. **C105 compensation never fired on a defect** (`@suluk/effect`, `suluk-fn.ts`, both `sulukFmt`'s linear path and
   `sulukFmt.all`'s fan-out path). `Effect.tapError` only observes the typed `E` failure channel; a later step that
   threw an ordinary exception (not a declared `httpError`) silently skipped rollback of everything the ledger had
   already recorded as succeeded — precisely the failure mode automatic compensation exists to protect against.
   **Fix**: `Effect.tapError` → `Effect.tapErrorCause` in both places (it re-raises the original cause
   automatically, same contract, but also observes Die/Interrupt). New tests for both paths, asserting the
   compensator ran even though the triggering failure is a genuine `Cause.Die`.
3. **A table's `.policy()` bled dedupe/idempotency onto reads sharing its table** (`registry/foundation/app/app.ts`,
   C111's own gap). `policyOf`/`nodeOf` applied a table's dedupe/`requiresIdempotencyKey`/`idempotencyKeySource`
   to EVERY model touching that table with no read-vs-write distinction — a plain `queryOne` SELECT next to a
   `mutate`/insert-via-`queryOne` over the same `payment`-shaped table inherited a write-oriented policy it had no
   business carrying (a GET synthesizing a 409, or getting deduped/replayed against a stale read). **Fix**: new
   `@suluk/drizzle` `queryKind(query)` (verified by direct probe: `config.fields`⇒select, `config.set`⇒update,
   `config.values`⇒insert, else⇒delete — uniform across the four real drizzle-orm builder shapes) gates the
   write-only fields (`dedupe` in `policyOf`; `requiresIdempotencyKey`/`idempotencyKeySource`/`dedupe` in `nodeOf`)
   behind `queryKind(builtQuery) !== "select"`. `retry`/`timeoutMs`/`idempotent`/`effect`/`rateLimit` stay universal
   (a flaky read can legitimately want a retry too). Verified end-to-end via a throwaway scratch package (built,
   checked, deleted) showing a read gets `retry` but not `dedupe`, a write gets both.
4. **`sulukFmt.branch` resolved dedupe/rateLimit by declaration order, not by which case runs** (`suluk-fn.ts`).
   Unlike `cost` (already given a deliberate MAX-across-cases override, since only one case is ever billed),
   `dedupe`/`rateLimit` fell through `mergeSlices`' generic first-declared-case-wins `inherit()` — a sensitive
   case (e.g. a card charge needing real double-charge protection) could silently inherit an unrelated case's
   (wrong) header name, so a genuine duplicate on the sensitive path was never deduplicated. **Fix**: a new
   `agreeOrUndefined` helper — keep the value ONLY when every case that declares one agrees exactly (byte-for-byte);
   otherwise `undefined` (the SAME "honest absence over a silently-wrong guess" rule `SulukRunGraph.resultNode`
   already uses when a graph's true terminal is ambiguous). Applied to both `dedupe` and `rateLimit` in `branch`.
5. **`mergeGraphs` silently dropped a same-labeled node's schema** (`suluk-fn.ts`, lower severity — a graph-facet
   accuracy issue, not a runtime-correctness one, since `x-suluk-run` is advisory and the request matcher never
   reads it, per the codebase's D1 invariant). Two independently-authored nodes sharing a label under
   `sulukFmt.all` collapsed into one (first-wins), even though both genuinely execute and both contribute to the
   real wire response — misleading any doc/BDD/journeys codegen that trusts the graph. **Fix**: `mergeGraphs` now
   throws a clear error at composition time (module load, not request time) when two DIFFERENT nodes share a
   label — but NOT when the exact same node is legitimately reused twice under different keys (compared by value,
   not identity), which stays a no-op exactly as before.

## Registry layering (operator-stated mid-review, not from the automated review)

Operator: *"routes can only import services... services can only import other services and models, no thirdparty
packages... models cannot import models or services, but it can and should use import thirdparty packages when
needed."* `registry/services/todo/todo.ops.ts` (the SERVICE layer) directly imported `effect` and `zod` to build
one inline leaf `sulukFn` (`confirmDeleted`, mapping the delete model's `void` to `{deleted:true}`) — a real
violation. **Fix**: moved `confirmDeleted` into `todo.model.ts` (the MODEL layer, where third-party imports belong)
and exported it; the service now only imports `@suluk/effect` (the composition vocabulary — `sulukFmt` — every
layer needs, not counted as "third-party" for this rule) and `../models/todo`. Zero behavior change (same
`sulukFmt(M.dropTodo, M.confirmDeleted)` composition, same emitted contract) — a pure layering cleanup. Saved as
its own durable memory (`registry-layering-import-boundaries`) since the rule isn't fully derivable from the
current code alone.

## Review process (for the record)

8 independent Agent-tool finder passes (line-by-line scan, removed-behavior audit, cross-file tracer, reuse,
simplification, efficiency, altitude, CLAUDE.md conventions) over the full ~101-file uncommitted diff, each
returning up to 6 candidates with a concrete failure scenario. 5 correctness/altitude-flagged candidates were
selected for independent 1-vote verification (each verifier given the diff + files + candidate, asked to
CONFIRM/PLAUSIBLE/REFUTE with cited evidence and, where useful, a real reproduction script); all 5 came back
CONFIRMED. Additional lower-priority candidates surfaced (reuse: several duplicated type-shape literals across
core/effect/drizzle that could share a named type; simplification: `policyOf`/`nodeOf`'s duplicate table lookup,
`sulukFn`/`ref()`'s duplicated node-wiring body; efficiency: `withNodeControls` rebuilding its `Schedule` per
request instead of once at composition time, `enforceDedupe`'s synchronous `res.clone().text()` + store write on
the request's critical path, `MemoryDedupeStore`'s unbounded growth under high key cardinality — already
documented dev-only; conventions: none found) were NOT independently verified or fixed in this pass — noted here
as a lower-priority backlog, not silently dropped. The `HttpStatus` wildcard narrowing (`"2XX"`/`"3XX"`/`"4XX"` no
longer valid, only `"5XX"`) the removed-behavior angle flagged was checked against C103's own ADR and confirmed a
DELIBERATE, already-decided fix from a prior session, not a regression from this diff.

## Consequences

- `@suluk/hono`, `@suluk/effect`, `@suluk/drizzle`, `registry/foundation/app/app.ts` each gain a small, targeted
  fix + regression test. Zero breaking changes to any existing passing test.
- Full ecosystem sweep: 1969 tests, zero fail, zero typecheck errors (up from 1959 pre-fix; +10 new regression
  tests for the 5 confirmed bugs). Conformance harness 8/8.
- This is the gate before the pending version-bump/publish/push/autotoolfactory-adoption step — those proceed on
  a reviewed, fixed baseline rather than on the raw C099–C111 diff.

Pairs with `plan/facts/0review-fixes-registry-layering.bn`.
