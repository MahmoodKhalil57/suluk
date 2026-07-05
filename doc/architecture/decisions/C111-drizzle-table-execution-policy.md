# C111 — drizzle table `.policy()`: the C104–C110 execution-policy facets, sourced from the table

> **Provenance.** A Suluk *candidate* decision (codename `asl-ojs`), authored by the single contributor, grounded in
> burhan/daftar/mizan — **not** a Moonwalk SIG decision. Operator-driven (2026-07-05). Verbatim ask: *"connect our
> changes to core hono and effect with drizzle inline zod to allow bubbling up everything about the response and
> connecting input types with drizzle fields directly when its the source of truth etc....."* Scoped via an
> `AskUserQuestion` (the response/input side — `queryOne`/`queryMany`/`mutate` deriving `ok.schema` from a query's
> drizzle projection, and the request body from `table.zodSchema.pick(...)` — already existed from a prior
> session's C098; re-verified, unchanged, still correct). The operator picked the concrete remaining gap: *"let a
> drizzle column/table declare execution-policy metadata (retry, dedupe, requiresIdempotencyKey, effect kind) via
> `.zod()`-style co-location, so `queryOne`/`mutate` picks it up automatically instead of being hand-set per
> route."* This ADR is that feature.

**Status:** BUILT + VERIFIED. `@suluk/drizzle` **76/76** tests pass (8 new). `@suluk/effect` **148/148** (2 new).
Full 30-package ecosystem sweep: **1959 tests pass, zero fail, zero typecheck errors**. Conformance harness 8/8.
Verified end-to-end against the REAL `todo` registry module (a throwaway scratch package, deleted after use) — zero
typecheck impact on the unmodified exemplar — plus a runtime proof that a table's `.policy()` genuinely reaches the
emitted route contract.

## Decision

**`@suluk/drizzle`: `table.policy({...})` + `tablePolicy(table)` + `queryTable(query)`** (`src/policy.ts`) — the
same co-location move as `.zod()` (`inline-zod.ts`), one concern over: a table declares its execution policy ONCE,
alongside its DDL:

```ts
const payment = sqliteTable("payment", { ... }).policy({
  dedupe: { ttlMs: 60_000, keySource: { header: "Idempotency-Key" } },
  requiresIdempotencyKey: true,
  retry: { times: 3, whenErrorTags: ["ExternalServiceError"] },
});
```

`queryTable(query)` reads the table ANY drizzle query builder centrally touches — `config.table`, verified present
uniformly across `select`/`insert`/`update`/`delete` builders (a real probe against the installed drizzle-orm, not
an assumption). This is what makes the connection AUTOMATIC: no explicit `table:` parameter is needed at a model's
own call site — referencing the table inside the query (`db.insert(payment)...`) is what a backend dev already
writes, and that's now sufficient for the policy to be found.

**`registry/foundation/app/app.ts`: `queryOne`/`queryMany`/`mutate` read it automatically.** Each now builds its
query once (as they already did, to read `queryZodSchema`'s projection) and, off that SAME build-time object, calls
`queryTable` → `tablePolicy` to resolve `rateLimit`/`dedupe` (folded into the derived `sulukFn` unless the call site
passes an explicit override) and, if the model opts into the `x-suluk-run` graph via a new `node?: string` label,
the node's `retry`/`timeoutMs`/`idempotent`/`effect`/`requiresIdempotencyKey`/`idempotencyKeySource` too — a model
states only the label; every execution-policy field comes from the table.

**`@suluk/effect`: a NEW top-level `sulukFn({ dedupe })` field** (distinct from the existing `node.dedupe`
graph-only mirror, C110) — mirrors the existing top-level `rateLimit` field exactly: it bubbles through
`mergeSlices` (INHERIT: own wins, else the first layer that declares one — dedupe policies aren't orderable by
"tightest" the way rate budgets are) and lands on the final `RouteContract.dedupe`, which `@suluk/hono`'s
`enforceDedupe` REALLY reads and enforces. This closes the loop C110 left open: C110 gave `SulukRunNode.dedupe` a
graph-level *reflection*; this ADR gives `sulukFn` a route-level field that is *actually enforced* — the
distinction matters and both are documented as such at their declaration sites. `@suluk/effect`'s `route.ts`
(`EffectRouteSpec`) gained the matching passthrough field.

**Gap closed in passing**: `SulukDedupe` (added to `@suluk/core` in C110) was never re-exported from
`@suluk/effect`'s public `index.ts`, unlike `SulukRateLimit` — a real omission, fixed here so a consumer (like
`registry/foundation/app/app.ts`) can import the type from `@suluk/effect` directly.

## Why this design

- **Automatic, not opt-in-per-call**: the operator's own phrasing ("picks it up automatically") ruled out an
  explicit `table:` parameter design — `queryTable`'s `config.table` read makes the table-detection free, riding
  the SAME build-time query object `queryZodSchema` already reads (no query built twice).
- **Real enforcement where it matters, honest reflection where it doesn't**: `dedupe`/`rateLimit` are REAL (HTTP
  layer, `@suluk/hono`); `retry`/`timeoutMs` are REAL too, but only once a model opts into a graph `node` (the same
  honest boundary `sulukFn`'s own `node.retry`/`node.timeoutMs` already draw); `idempotent`/`effect`/
  `requiresIdempotencyKey`/`idempotencyKeySource` stay DECLARED-ONLY — no new enforcement mechanism invented for
  them, just a new AUTHORING location (the table, instead of every route).
- **No forced adoption**: the `todo` exemplar module was left completely untouched — it has no dangerous writes
  needing dedupe/retry, so giving it a fabricated `.policy()` just to "show the feature" would have been an
  invented scenario, not a real one. The mechanism is proven by `@suluk/drizzle`'s own tests, `@suluk/effect`'s
  bubbling test, and a throwaway end-to-end script (deleted after use) against a realistic `payment`-shaped table.

## Consequences

- `@suluk/drizzle` gains one new file (`policy.ts`, ~90 lines) + 2 new exports (`tablePolicy`, `queryTable`) + 1
  new type (`TableExecutionPolicy`). Zero breaking changes; the `todo` module (and everything else) is unaffected
  unless a table opts in via `.policy()`.
- `@suluk/effect` gains one additive `sulukFn`/`RequestSlice`/`EffectRouteSpec` field (`dedupe`) + a re-export fix.
- `registry/foundation/app/app.ts` (`queryOne`/`queryMany`/`mutate`) gains 3 additive optional `QueryBase` fields
  (`rateLimit`, `dedupe`, `node`) + two small resolver helpers. Verified byte-for-byte zero typecheck impact on the
  real `todo` module via a throwaway scratch package (built, `tsc`-verified clean, deleted — not committed).
- Full ecosystem sweep: 1959 tests, zero fail, zero typecheck errors.

Pairs with `plan/facts/0drizzle-table-execution-policy.bn`. Closes the loop opened by C108's own recommendation and
completed in C110; extends C098 (the original response/input-from-drizzle wiring, prior session) one level further
— to the C104–C110 execution-policy facets.
