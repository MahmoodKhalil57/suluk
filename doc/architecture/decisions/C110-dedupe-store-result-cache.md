# C110 — the dedupe/result-cache store, mirroring `RateLimitStore`; reflected in `@suluk/effect`

> **Provenance.** A Suluk *candidate* decision (codename `asl-ojs`), authored by the single contributor, grounded in
> burhan/daftar/mizan — **not** a Moonwalk SIG decision. Operator-driven (2026-07-05): *"also enforce dedupe store
> + result caching in suluk/hono's RateLimitStore and reflect in suluk/effect."* This is the item C108 named
> explicitly out of scope and recommended a dedicated path for: *"a real `dedupe: {scope, ttlMs, key}` store...
> structurally belongs next to `@suluk/hono`'s existing `RateLimitStore` pattern... a dedicated ADR scoping a
> `DedupeStore` interface (mirroring `RateLimitStore`'s shape), decided on its own."* This ADR is that dedicated
> decision, not a same-day reactive bolt-on — it followed C108 by enough of a gap in this session (after C109's
> unrelated fix-and-verify pass) to have been requested as its own explicit ask.

**Status:** BUILT + VERIFIED. `@suluk/hono` **94/94** tests pass (12 new). `@suluk/effect` **146/146** tests pass (3
new). Full 30-package ecosystem sweep: zero typecheck errors, zero test failures (1949 total). Conformance harness:
all 8 checks pass.

## Decision

**`@suluk/core`: `SulukDedupe`** — a new `x-suluk-dedupe` facet on `Request`, shaped exactly like the existing
`SulukRateLimit` (`ttlMs`, an optional `scope`, `description`) plus a `keySource: {header: string} | {bodyField:
string}` — always a REQUEST-level source the caller sent, never a node-output binding (the same D1-safe boundary
`SulukRunNode.idempotencyKeySource`, C108, already drew: nothing here can be pressured into resolving a dynamic
request VALUE as an instruction, only naming a stable slot to read one from).

**`@suluk/hono`: `DedupeStore` + `MemoryDedupeStore` + `enforceDedupe`** (`src/dedupe.ts`) — a REAL, ENFORCED
implementation mirroring `ratelimit.ts`'s three deliberate shapes exactly:
- the durable state is a swappable binding (`DedupeStore.reserve`/`.complete`/`.release`); `MemoryDedupeStore` is a
  dev-only per-instance Map, same caveat as `MemoryRateLimitStore` (a production KV/Durable-Object store belongs in
  `@suluk/deploy`);
- one clock owner (`now`), so the store stays a pure function of its inputs;
- default-unmetered, opt-in (an op without a declared `x-suluk-dedupe` facet is never deduped).

`reserve` is the atomicity point: a fresh key runs the real handler; a key already **in-flight** (reserved by a
concurrent duplicate that hasn't finished) is rejected **409 Conflict** (the existing `ConflictError` tag — no new
error taxonomy needed, 409 was already the right status); a key that already **completed** REPLAYS the recorded
response verbatim (status + body + content-type, tagged `x-suluk-dedupe-replay: true`) instead of re-running the
handler — this is result caching, not just duplicate-rejection: a retried request with the same idempotency key
gets the SAME outcome (success or a domain error) rather than double-executing a side effect. A handler that
throws `release`s its reservation so a genuine retry isn't stuck "in-flight" forever; a stale in-flight reservation
also self-heals once its TTL passes (the fail-safe against a crashed handler that never released).

`enforceDedupe`'s default key extraction reads the declared source: a header via `c.req.header`, or a body field
via `c.req.json()` — verified (by an explicit test) that Hono's `bodyCache` means the middleware's own peek at the
JSON body does NOT consume the request stream, so the real downstream handler's own `c.req.json()` call still sees
the full body.

**`RouteContract.dedupe?: SulukDedupe`** (mirroring `.rateLimit`) — `emitV4` stamps it onto the operation
(`x-suluk-dedupe`) and synthesizes a 409 response when declared, exactly like `.rateLimit` synthesizes 429.

**Reflected in `@suluk/effect`**: `SulukRunNode.dedupe?: { ttlMs: number; scope?: string }` — DECLARED-ONLY
(advisory), threaded through both `sulukFn`'s `node` options and `ref`'s options (the same two sites
`idempotencyKeySource`/`requiresIdempotencyKey`/`effect` already thread through). This is a REFLECTION, not a
second enforcement point: `@suluk/effect` itself still enforces nothing (calling a `dedupe`-declared node twice
still runs it twice — proven by a dedicated test) — the real store lives at `@suluk/hono`'s HTTP boundary. This
closes the gap `requiresIdempotencyKey`'s own C108 doc comment named ("a real [store]... belongs [at the HTTP
layer]... not bolted onto this pure-Effect graph facet") — the store is now built there; this field is just the
graph-level mirror of that same policy, so a graph-only reader (e.g. a future `@suluk/journeys` audit) can see the
concrete budget without re-reading the raw document facet.

## Why NOT the "derived binding" / value-ref half again

`keySource` deliberately supports only `{header}`/`{bodyField}` — a request-level source name — never a
`{fromNode, fromPath}`-style graph binding. This is the SAME boundary C107/C108 already drew twice: no non-
TypeScript consumer justifies the symbolic value-reference/interpreter machinery that binding would require: every
capability here routes through a real TypeScript function (the middleware's `keyOf`) supplied at construction
time; only the resolved facet DATA (the key's name, not its value) lands on the wire-safe graph facet.

## Consequences

- `@suluk/core` gains one additive/optional field (`Request["x-suluk-dedupe"]`) + one new exported type
  (`SulukDedupe`). Zero breaking changes.
- `@suluk/hono` gains a new module (`dedupe.ts`, ~155 lines) + `RouteContract.dedupe` + a 409 in
  `errorStatusesFor`/the stamp in `emitV4`. Zero impact on any existing route (nothing in the ecosystem declares
  `dedupe` yet).
- `@suluk/effect` gains one additive/optional field on `SulukRunNode`, threaded through both node-construction
  sites. Zero impact on any existing pipeline.
- Full ecosystem sweep: zero errors, zero regressions (1949 tests across ~30 packages).

Pairs with `plan/facts/0dedupe-store-result-cache.bn`. Extends C108 (same session, deliberately NOT a same-day
reactive bolt-on — C108 explicitly recommended this exact path as its own decision).
