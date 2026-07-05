# C115 — atomic batch writes + an opt-in query cache; `db.transaction()` disabled (broken on real D1)

> **Provenance.** A Suluk *candidate* decision (codename `asl-ojs`), authored by the single contributor, grounded in
> burhan/daftar/mizan — **not** a Moonwalk SIG decision. Operator-driven (2026-07-05): *"we should bake in drizzle
> transactions cache and batch-api in suluk/drizzle and suluk/platform packages given our new changes to suluk
> C99-C113 to super power our model layer as well without defaulting into any features that can make usage more
> exensive, any opinionated defaults should mean automatic cheaper cost which we should aim for"* (with drizzle's
> transactions/cache/batch-api docs as references). Mid-build, the operator asked directly why `db.transaction()`
> crashes on D1 and whether raw SQL could be "baked in intuitively," and pointed at drizzle's dynamic-query-building
> docs — both are answered inline below.

**Status:** BUILT + VERIFIED. `@suluk/drizzle` **105/105** tests pass (13 new). Full 46-package ecosystem sweep:
**zero fail, zero typecheck errors.** Verified end-to-end via a throwaway scratch package (built, checked, deleted,
never committed) against the real, unmodified `app` + `todo` module.

## The finding that shaped this decision: `db.transaction()` is genuinely broken on Cloudflare D1

Direct source inspection (`drizzle-orm/d1/session.js`) shows `db.transaction()` issuing separate `.run()` calls for
raw `begin`/`commit` (and `savepoint`/`release savepoint`/`rollback to savepoint` for nested transactions) — each
its own network round trip. **Why that fails**: Cloudflare D1 is a stateless HTTP RPC surface — every call from a
Worker is an independent request with no session tying it to the next one. A real SQL transaction needs the
database to hold ONE session open across `BEGIN → ... → COMMIT` so it knows what to roll back and can isolate
concurrent access until commit; D1 has no notion of "these two separate calls belong to the same open transaction,"
so `BEGIN` is a no-op, nothing is isolated in between (D1 auto-commits per statement/batch), and `COMMIT` commits
nothing. This is confirmed by drizzle-orm's own GitHub issues (#2463, #4212, #758) and by Cloudflare's own runtime
error, which explicitly redirects to `state.storage.transaction()` — a Durable-Object-only API this stack doesn't
use. **No amount of clever wrapping fixes this** — it is an architectural gap (stateless multi-tenant HTTP RPC), not
a driver bug; raw SQL `BEGIN`/`COMMIT` cannot be safely "baked in intuitively" on D1 by any wrapping discipline.

**A second, sharper finding**: this stack's own local-dev shim (`@suluk/cloudflare`'s `d1FromSqlite`) runs on a
REAL, persistent `bun:sqlite` connection wrapped to look like D1 — so `db.transaction()` would silently *appear* to
work in local dev (a genuine session exists there) and only break once the exact same code deploys to real D1. That
makes it worse than a simple unsupported feature: it is a silent dev/prod divergence trap.

`db.batch()` is the primitive Cloudflare actually supports: every statement travels in ONE request, so D1 (and the
dev shim, and libSQL) can wrap them in one real all-or-nothing unit server-side with no cross-call session
required — confirmed directly (`drizzle-orm/d1/driver.d.ts`'s `batch<U,T>` is fully tuple-typed) and via Cloudflare's
own D1 docs ("Batched statements are SQL transactions... aborts or rolls back the entire sequence"). The tradeoff:
every statement must be built up front — no reading an intermediate result mid-sequence to decide the next one
(confirmed: `bun:sqlite`'s driver has NO `.batch()` method at all — it's a remote/HTTP-driver-only primitive, absent
from the local synchronous driver where there's no round-trip to amortize). Drizzle's dynamic-query-building
(`.$dynamic()`) is a real, useful mechanism for writing generic, reusable query-transform helpers across
select/insert/update/delete — but it's an orthogonal convenience feature (multi-call `.where()`/`.orderBy()`
chaining), not a transaction workaround; `@suluk/drizzle`'s existing `compileFilter`/`compileSort` (C114) already
compose conditions before a single terminal call, so no change was needed there.

## Decision

**`@suluk/drizzle` gains three primitives, all opt-in, none defaulted into a more expensive path:**

- **`atomicBatch(db, statements)`** (`batch.ts`) — a thin, precisely-typed wrapper over `db.batch()`. Fewer
  Worker↔D1 round trips than the naive sequential form it replaces (cheaper by construction, never more expensive).
  For a conditional read-then-write (can't be expressed as a batch — no branching on an intermediate result), the
  existing `cas.ts` `claimOnce`/`claimRows` remain the answer: a single conditional `UPDATE ... RETURNING` is
  already atomic on its own, no batch or transaction needed.
- **`guardTransactions(db)`** (`batch.ts`) — shadows the drizzle db's `.transaction` own-property with one that
  throws immediately, in dev AND prod alike, closing the silent-divergence trap described above. Implemented as a
  targeted `Object.defineProperty` on the ONE `transaction` key (not a `Proxy` over the whole object — a full-object
  Proxy risks breaking `this`-bound private-field access on every OTHER drizzle method for zero benefit); every
  other method (select/insert/update/delete/batch/query/...) is untouched on the same real instance.
- **`SulukCache`** (`cache.ts`) — a `drizzle-orm/cache/core` `Cache` implementation with **no new paid dependency**:
  drizzle's own built-in backend is Upstash Redis (an external paid service this stack doesn't otherwise need).
  `SulukCache` is backed by Cloudflare's free `caches.default` Fetch-API cache in prod (zero binding, zero
  provisioning, zero KV billing) and a plain in-memory `Map` in dev. `strategy()` is fixed to `"explicit"` — never
  `"all"` — so caching stays off by default and a query opts in one at a time via `.$withCache()`, mirroring
  drizzle's own already cost-conscious default. `onMutate` is a **deliberate no-op**: actively invalidating on every
  write would cost an extra lookup+delete on EVERY mutation (including ones whose table was never cached) just to
  keep a table→keys index current — a real, ongoing cost for a feature that's supposed to be free until opted into.
  Instead it's TTL-only (default 60s) — an entry expires on its own; only cache a query that can tolerate that
  staleness window.

**Wired into `registry/foundation/app/app.ts`'s `DbLive`** (the file `@suluk/platform`'s generator delivers into
every generated app, satisfying the "bake into suluk/platform" half of the ask without touching platform's own
source — `registry/` IS the template platform's generator fetches): `db.transaction()` disabled unconditionally (a
pure safety net — no existing correct code path changes, only a previously-silently-broken pattern now fails loud
and early instead of late and confusing); a `SulukCache` wired with an environment-detected backend
(`typeof caches !== "undefined"` → Cloudflare's Cache API in a real Worker; else an in-memory Map for `bun dev`) —
inert (zero behavioral or cost change) until a model explicitly opts a query in. `atomicBatch` is re-exported from
`../app` (mirroring the existing `tableZod`/`tablePolicy` re-export convention) so a model composing several
statements needs no separate `@suluk/drizzle` import.

**Not adopted into `todo`**: `todo`'s simple per-user CRUD has no natural multi-statement-atomicity or
staleness-tolerant-read need — matching the established discipline (C111/C114) of building the general primitive
and adopting it only where a real, non-fabricated fit exists, not force-fitting every new capability into the one
exemplar module.

## Consequences

- `@suluk/drizzle` gains `atomicBatch`, `guardTransactions`, `SulukCache`, `memoryCacheBackend`,
  `cloudflareCacheBackend`, plus the `BatchDb`/`CacheBackend`/`FetchCacheLike` types. No breaking changes.
- `registry/foundation/app/app.ts`'s `DbLive` now disables `db.transaction()` and wires a `SulukCache` by default
  (behaviorally inert for any query that doesn't call `.$withCache()`).
- READMEs updated (`@suluk/drizzle`, `registry/foundation/app`) with the new capability, the D1-transaction
  rationale, and usage examples.
- Full ecosystem sweep: zero fail, zero typecheck errors across 46 packages.

Pairs with `plan/facts/0atomic-batch-cache-transaction-guard.bn`.
