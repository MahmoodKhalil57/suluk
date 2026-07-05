# C108 — per-node execution-policy metadata + real retry-tag filtering

> **Provenance.** A Suluk *candidate* decision (codename `asl-ojs`), authored by the single contributor, grounded in
> burhan/daftar/mizan — **not** a Moonwalk SIG decision. Operator-driven (2026-07-05), extending
> [C107](C107-run-graph-recover-project-serialized-policy.md) same-day. Operator asked for a 5-item cluster:
> idempotency-key declaration (sourced from a header/body field/**derived binding**), an ENFORCED dedupe store
> (`dedupe: {scope, ttlMs, key}`), per-node execution policy (`effect: "read"|"write"|"emit"` +
> `requiresIdempotencyKey`), retry filtering (`retry.whenErrorTags`), and result caching keyed by the idempotency
> key. Two of the five are real, bounded, pure-Effect/pure-data extensions — built here. Three require a genuine
> storage backend and are a categorically different kind of feature — named explicitly out of scope, not silently
> built or silently dropped (see the session record for the direct explanation).

**Status:** BUILT + VERIFIED. `@suluk/effect` **143/143** tests pass (6 new beyond C107's 137). Full 30-package
ecosystem sweep: zero typecheck errors, zero regression. Same two pre-existing, unrelated failures as C104–C107.

## Decision

**`SulukRunNode.effect?: "read" | "write" | "emit"`** and **`.requiresIdempotencyKey?: boolean`** — both DECLARED-ONLY
(advisory), the same honest boundary `idempotent` already draws: pure metadata, never enforced, never read by
`@suluk/effect` to change behavior. Value: a reader/auditor (a future `@suluk/harden` check) can now flag, e.g., a
`retry`-bearing node whose `effect` is `"write"`/`"emit"` and `idempotent` isn't `true` — a real audit rule becomes
expressible without any new runtime machinery.

**`retry.whenErrorTags?: string[]`** — DECLARED-AND-ENFORCED: a real `Schedule.recurWhile` filter is intersected
into the existing retry schedule, so a retry only fires for a failure whose tag is in the list; any other tag
propagates immediately on its first occurrence. Closes the "blindly retrying a possibly-non-idempotent failure" gap
directly — this was the one item in the operator's 5-item list that maps cleanly onto the existing Effect-combinator
pattern (`retry`/`timeoutMs`/`recover` already work this way) with no new infrastructure.

**`SulukRunNode.idempotencyKeySource?: {header: string} | {bodyField: string}`** — DECLARED-ONLY (advisory): closes
the *safe* half of the operator's idempotency-key ask (WHERE the key comes from, always a request-level source —
something the caller sent — never another node's output, so no value-resolution/interpreter is implied). Nothing
reads the request or extracts the value; this is pure documentation until a real dedup-store exists to hand it to.

**Explicitly out of scope — a categorically different feature, not silently built:** the *other* half of that ask,
"derived binding," reintroduces the symbolic value-reference mechanism C107 already declined (no non-TypeScript
consumer justifies the interpreter it would need) — `idempotencyKeySource` deliberately supports only request-level
sources, never a `{fromNode, fromPath}` binding. A real `dedupe: {scope, ttlMs, key}` store and result-caching keyed
by it require an actual storage backend — this is not a pure Effect combinator problem the way retry/timeout/race/quorum were; it needs a real KV/D1
(or similar) dependency, has its own distributed-systems correctness surface (concurrent-duplicate races, TTL/
eviction, cache-key scoping), and structurally belongs next to `@suluk/hono`'s existing `RateLimitStore` pattern —
a pluggable store abstraction at the HOST/HTTP layer — rather than bolted onto `x-suluk-run`'s pure-Effect graph
facet. Recommended path if this is wanted: a dedicated ADR scoping a `DedupeStore` interface (mirroring
`RateLimitStore`'s shape), decided on its own, not appended reactively to this arc.

## Consequences

- `@suluk/core` gains 4 additive/optional fields (`retry.whenErrorTags`, `effect`, `requiresIdempotencyKey` ×2 for
  node + ref). Zero breaking changes.
- **Zero impact on every existing route** — nothing in the ecosystem uses any of C108's new surface outside this
  package's own tests. Proven by the full 142/142 suite (137 pre-existing + 5 new) passing unchanged.
- This is the fourth ADR in this arc in one session (C104→C108). The operator has been told directly, in
  conversation, that continued rapid extension of `x-suluk-run` without a pause risks exactly the kind of
  vestigial/inconsistent design C107 caught in its own `opts.label` bug — a recommendation to treat any FURTHER
  extension as its own deliberately-scoped decision, not a reactive same-session bolt-on, stands.

Pairs with `plan/facts/0run-graph-execution-policy-retry-filtering.bn`. Builds directly on C104–C107 (this session,
same day).
