# C114 — thorough list-query filtering: SIMPLE flat params + a real, JSON-Schema-native ADVANCED filter tree

> **Provenance.** A Suluk *candidate* decision (codename `asl-ojs`), authored by the single contributor, grounded in
> burhan/daftar/mizan — **not** a Moonwalk SIG decision. Operator-driven (2026-07-05): *"the listTodo should have
> much more standard table features like limit and offset, sorting, and thorough filtering that would allow
> splunk parity auto tables with thorough simple or thorough advanced modes."* Scoped via an `AskUserQuestion` on
> the one genuinely ambiguous design point (the advanced-mode filter syntax); the operator redirected the answer
> toward *"the most thorough... solution that can be defined with json schema"* — which settled the design: not an
> opaque search string, but a real, recursive, Zod/JSON-Schema-native filter TREE.

**Status:** BUILT + VERIFIED. `@suluk/drizzle` **92/92** tests pass (21 new). Full 30-package ecosystem sweep:
**1990 tests pass, zero fail, zero typecheck errors**. Verified end-to-end via a throwaway scratch package (built,
checked, deleted, never committed) against the real, unmodified `todo` module's mounted routes.

## Decision

**`@suluk/drizzle`'s list-query primitive** (`query.ts`, "Phase 1" per its own header, previously built but
adopted by NO real registry module — confirmed by a repo-wide grep before starting) is extended, not replaced:

- **SIMPLE mode**: flat query params. `title=milk` is an implicit `eq`; `title__contains=milk` (Django-lookup-
  style operator suffix — `eq`/`ne`/`gt`/`gte`/`lt`/`lte`/`contains`/`startsWith`/`endsWith`/`in`/`notIn`/`isNull`/
  `isNotNull`) targets any of the 13 closed operators. Multiple simple params fold into an implicit AND. An
  unrecognized column or op is silently ignored (the same "unknown key dropped, never widened" invariant Phase 1
  already established for its equality-only filters) — never a 500, never a wider query than intended.
- **ADVANCED mode**: one JSON-encoded `filter` query param carrying a **`FilterNode`** — a recursive tree of leaf
  `{field, op, value}` conditions composed with `and`/`or`/`not`, arbitrarily nested. This is the Splunk-parity
  piece: full boolean nesting, not a flat AND. Because `FilterNode` is a real Zod type (`z.lazy` recursion), it is
  JSON-Schema-describable via `$defs`/`$ref` — `zodToV4` projects it precisely, the same way every other typed
  schema in this codebase does — rather than being documented as an opaque, format-unspecified string. When
  `filter` is present, SIMPLE-mode params are ignored outright (no ambiguous merge of two filter mechanisms).
- **Multi-column sort**: `sort=-createdAt,title` (comma-separated, per-token `-` prefix for descending). The
  legacy single `sort=col`+`order=desc` shape still works unchanged (`order` is the fallback direction for any
  token without its own `-`).
- **Free-text search**: `q=dog` — an OR of `contains` matches across every `dataType:"string"` column (or
  `opts.searchColumns`) — the `q` param Phase 1 already declared but never implemented.
- **Pagination**: `page`/`perPage` (unchanged from Phase 1) — clamped, opt-in by presence.

**Compilation** (`compileFilter`/`compileSort`/`compileTextSearch`) turns any of the above into REAL, bound
drizzle `SQL` — every leaf value is a parameter (`eq`/`gt`/`inArray`/…, never string-concatenated SQL), every
`field` is resolved off the table's own real column object, and an op the column's `dataType` doesn't support
(e.g. `contains` on a boolean) is a loud thrown error, never a silently dropped or silently misapplied clause.

**Real bug caught + fixed during this build**: drizzle's own `like()` helper emits a plain `LIKE` with NO `ESCAPE`
clause — so a value with `escapeLike`'s own `\%`/`\_` escaping would match the ESCAPE SEQUENCE literally instead of
the intended literal `%`/`_`. Caught by a test asserting `contains: "100%"` matches only the literal "100%" row,
not every row. Fixed with an explicit `sql\`${col} LIKE ${pattern} ESCAPE '\\'\`` (mirroring the exact pattern the
registry's own `logs` module already uses for the same reason) instead of drizzle's bare `like()`.

## Adopted in `listTodos`

`registry/services/todo/todo.model.ts`'s `listTodos` now takes the raw query record and builds a real,
paginated/sorted/filtered/searched query. The owner scope (`eq(todo.userId, ctx.userId)`) is the OUTERMOST `and()`
term, structurally un-bypassable by any caller-supplied filter — verified directly: a filter attempting
`{field:"userId", op:"eq", value:"other"}` returns EMPTY, never another caller's rows (AND of a contradictory
`userId` sub-condition is empty, never a widened result). A malformed ADVANCED `filter=` JSON is caught in the
model and treated as "no filter" (the same honest-default philosophy SIMPLE mode already applies) rather than
surfacing as an uncaught 500 — deliberately NOT fixed via a bigger change to `queryOne`/`queryMany`'s shared
`Effect.promise` error handling (which would blur the defect-vs-domain-error line for every model, not just this
one) — a two-line try/catch at the one call site that needs it is the narrower, safer fix.

**Respects the operator's routes→services→models import-layering rule** (stated mid-session, C112): the ROUTE
(`todo.routes.ts`) never imports `@suluk/drizzle` or the `todo` table — its controller only forwards the raw
`ctx.c.req.query()` record. The MODEL (which already imports the table) does all the parsing/compiling. The
SERVICE (`todo.ops.ts`) re-exports the model's pre-built `ListTodosQuery` schema so the route can declare it
without reaching past the service layer.

## Consequences

- `@suluk/drizzle` gains 6 new exports (`filterNodeSchema`, `compileFilter`, `compileSort`, `compileTextSearch`,
  `FILTER_OPS`, plus the `FilterOp`/`FilterCondition`/`FilterNode`/`SortSpec` types) and one intentional, narrow
  breaking change: `listQuerySchema`'s `sort` field is now `z.string()` (was a column-name enum) at the SCHEMA
  level, since multi-column comma-lists aren't a finite enum — column validity is checked at `parseListQuery` time
  instead (one existing test updated to match; `ListQuery.orderBy`/`.filters` kept as deprecated-but-present
  aliases for `@suluk/drizzle`'s own pre-existing `crudHandlers` consumer, unaffected).
- `registry/services/todo/{todo.model,todo.ops,todo.routes}.ts` updated; zero change to any other CRUD op.
- Full ecosystem sweep: 1990 tests, zero fail, zero typecheck errors.

Pairs with `plan/facts/0list-query-filter-dsl.bn`.
