# C117 — `registry/services/todo`: declarative cleanup — no manually-written types, no comments, self-documenting via naming

> **Provenance.** A Suluk *candidate* decision (codename `asl-ojs`), authored by the single contributor, grounded in
> burhan/daftar/mizan — **not** a Moonwalk SIG decision. Operator-driven (2026-07-05): *"cleanup the entire surface
> area of registry/services/todo such that the code is pragmatic and declaritive and self documenting and we can
> remove all manullay written typetypescript types and then remove all comments since function names should be
> intuitive enough and everything should be statically connected with typescript and can build a comprehensive
> detailed suluk openapiv4 document that we can even build BDD tests using primitives generated from it."*

**Status:** BUILT + VERIFIED. `@suluk/drizzle` **114/114** tests pass (9 new), `@suluk/effect` **157/157** (3 new +
1 strengthened). Full 46-package ecosystem sweep: zero fail, zero typecheck errors. Verified end-to-end via a
throwaway scratch package: live CRUD, C114's filter/sort/search surface, C116's dataType-mismatch safe-fallback,
the owner-scope-bypass invariant, a generated v4 OpenAPI document (descriptions/examples/cost/rate-limit/BDD-
scenario data all present), and real Gherkin BDD scenarios generated via `@suluk/journeys`'s
`renderScenarioOutlines` — all unchanged or improved after the cleanup.

An 8-agent-equivalent (4-reviewer) independent adversarial verification pass over the cleanup — cleanup-
completeness, behavior-parity, doc-completeness, security-adversary, each building their OWN throwaway harness,
not trusting any prior claim — surfaced **3 real, pre-existing bugs** (none introduced by this cleanup's comment/
type removal; two were exposed by it, since the cleanup's `resolveListQuery` extraction and the doc-completeness
reviewer's actual document inspection are what surfaced them). All three fixed here, at the source, verified.

## What "no manually-written types" means in practice

Applied the framework's own "define once, derive everywhere" discipline — already used for runtime schemas
throughout this codebase — to the TYPE level too:

- **Removed dead type aliases**: `TodoRow`, `TodoItem`, `TodoItemSchema` (grepped the whole `registry/` tree —
  referenced only inside their own file's comments, never actually imported/used anywhere).
- **Removed hand-written inline object types where TypeScript already infers them contextually**: `updateTodo`'s
  controller (`todo.routes.ts`) declares `body: UpdateReq` and `run: (ctx, patch: {...}) => ...` in the SAME
  `sulukFn` call — verified empirically (a throwaway compile check) that TS's contextual inference already
  connects `body`'s concrete schema type to `run`'s second parameter with zero annotation needed; `patch: {...}`
  was a pure duplicate of what `UpdateReq` already says.
- **Replaced a hand-written duplicate shape with a derivation**: `patchTodo`'s model-layer query function needed a
  `{ id, patch }` parameter type (no sibling schema to infer from — `id` is a path param, not part of the JSON
  body) — the old code hand-wrote `patch: { title?: string; completed?: boolean }` field-by-field, duplicating
  `UpdateReq`'s shape; now `patch: z.infer<typeof UpdateReq>` **derives** it instead.
- **Kept genuinely necessary seed points**: `createTodo`'s controller has no sibling `body` field on its own
  `sulukFn` (deliberately, to avoid restating what the model's `input` already bubbles up) — so `run`'s parameter
  needs *some* type source; kept as `z.infer<typeof CreateReq>`, a derivation off an existing schema, not a
  hand-written shape. Likewise `id: string` for by-id operations (no request body to infer from at all) is the
  minimal, single-occurrence seed a function parameter needs — not a duplicate of anything.
- **`satisfies` instead of `:` for literal object exports**: `readCost`/`writeCost`/`deleteCost` (`CostModel`) and
  `todoProvision` (`InstanceSpec[]`) switched from an explicit type annotation to `satisfies`. Verified empirically
  that dropping the annotation entirely (no `satisfies` either) silently WIDENS string-literal fields
  (`settlement.method: "rate-limited"` → `string`), breaking assignability at the point of use — `satisfies`
  preserves the narrow literal type while still validating shape, the correct idiom here, not a regression risk.
- **Removed a type-only array variable**: `todo.routes.ts`'s `const routes: AnySulukFn[] = [...]` collapsed to an
  inline array literal in the `for` loop — no named, annotated intermediate needed.

## A real architectural improvement, not just cosmetics: `resolveListQuery`

`todo.model.ts`'s `listTodos` had a hand-rolled try/catch (added in C116 to fix a real bug: a filter op invalid for
its column's dataType threw past the "never a 500" guarantee). That fix pattern — parse + compile + fall back to
scope-only/unfiltered/default-sort/default-page on ANY failure — is inherently reusable by any future model using
the C114 filter DSL, and C116's own ADR flagged "any other model built the same way" as an open risk. Extracted
into `@suluk/drizzle`'s new `resolveListQuery(table, raw, scope, defaultOrderBy, opts?)`
(`tooling/ts/packages/drizzle/src/query.ts`) — `listTodos` now reads as a declarative one-liner naming its intent
instead of an inline try/catch needing a comment to explain why. This also closes the C116-flagged risk at the
source: the safe, bug-fixed chain now lives in ONE place, not copy-pasted per table.

## OpenAPI + BDD generation verified, not assumed

Per the operator's stated goal, directly confirmed (not just claimed) via a throwaway scratch harness:

- `emitV4(todoOps)` produces a document where `GET /api/todos`'s `parameterSchema.query` fully describes
  `page`/`perPage`/`sort`/`order`/`q`/`filter` as real JSON Schema (not an opaque string), column
  descriptions/examples (`"The todo text."`, `"Buy milk"`) appear in the component schemas, and every operation
  carries its `x-suluk-cost`/`x-suluk-ratelimit`/`x-suluk-scenario` facets.
- `@suluk/journeys`'s `renderScenarioOutlines(document)` produces real, readable Gherkin covering all 6 operations
  (including negative-`Then` scenarios for each 404 path) directly off the (now comment-free) `step` fields — zero
  hand-authored test scaffolding needed.

## Three real bugs found by the adversarial pass, fixed at the source

**Bug 1 — `sulukFmt`'s `ok` merge was atomic, silently discarding a schema.** `createTodo`'s controller declares
only `ok:{status:201}` (deliberately — the model's `ok.schema` already bubbles up, per the whole framework's
"nothing restated" discipline); `mergeSlices`' `ok: inherit(own.ok, deps, (s) => s.ok)` treated `ok` as ONE atomic
value, so `own.ok` (status-only) won outright and erased the dependency's full schema. Reproduced directly: the
actual emitted `CreateTodoOk` component was `{ properties: { todo: {} } }` — the wrapper survived, the entity
schema inside it didn't. The pre-existing unit test covering this exact route only asserted the OUTER `properties`
key names (`["item"]`), never inspected what was nested inside — too shallow to catch it. **Fix**: `mergeSlices`
now merges `ok.status`/`ok.schema`/`ok.description` independently (own wins per-field, else first dep that
declares it) via a new `mergeOk` helper, mirroring `mergeStore`'s existing per-field shape. The weak test
strengthened to check the nested schema; 3 new tests added covering the exact bug + own-still-wins + description
survival. `@suluk/effect` 0.14.1 → 0.14.2.

**Bug 2 — an oversized advanced `filter=` crashes past `resolveListQuery`'s own safety net.** A 100%
schema-valid, dataType-valid filter tree with ~1000+ sibling/nested boolean conditions (e.g. a flat `{or:[...]}`
of 1000 leaf `eq`s, or an equally deep `{not:{not:...}}` chain) passes `filterNodeSchema` and `compileFilter`
cleanly — `resolveListQuery`'s try/catch never fires — but SQLite (and D1) reject the compiled expression at
EXECUTION time with "Expression tree is too large (maximum depth 1000)", which surfaces as an unhandled 500 from
inside the model's own `db.select()` await, entirely outside `resolveListQuery`'s boundary. Not a cross-user leak
(the 500 body is generic, no data), but a real, deterministic, attacker-triggerable crash on ordinary read
traffic — directly adjacent to, but distinct from, the C116 bug class this same cleanup's extraction was built to
close for good. **Fix**: `filterNodeSchema` now rejects a tree past `opts.maxFilterNodes` (default 200, well under
SQLite's limit with margin) via `.refine()` — validation-time, so it's already inside every caller's existing
try/catch (`resolveListQuery`'s included) rather than needing a new catch site. `@suluk/drizzle` 0.11.1 → 0.12.0
(a new, additive `ListQueryOptions` field; the default behavior change — rejecting a previously-crashing input
instead of crashing — is not considered breaking).

**Also fixed (cheap, low-risk, found by the same pass):** the `listTodo` route binding renamed to `listTodos` for
naming consistency with the plural `listTodos` used everywhere else (model/service/route `name` field) — purely
cosmetic, no behavior change. `filter`'s wire schema gained a `.meta({description, examples})` so the JSON-encoded
shape is at least human-documented in the emitted doc.

**Flagged, NOT fixed** (real, but a genuine v4-spec-level design question, not a narrow fix): the doc-completeness
reviewer confirmed `filter` is *not* `$defs`/`$ref`-linked to `filterNodeSchema`'s real recursive JSON Schema in
the actual emitted document — it's a bare `{"type":"string"}` (C114's own ADR overclaimed "JSON-Schema-describable
... the v4 doc/SDK can render exactly" for this specific param). A query-string param is inherently flat text, so
fully closing this gap needs a general mechanism for "a string parameter whose content is described by a separate
JSON Schema" (OAS3 has `parameter.content`; Suluk's v4 candidate doesn't yet) — a foundational, cross-cutting
decision affecting every future feature with this shape, not a todo-module or even `@suluk/drizzle`-scoped fix.
Surfaced here for a deliberate future decision rather than a rushed partial fix.

## Consequences

- `@suluk/drizzle` gains `resolveListQuery` + `ResolvedListQuery` + `ListQueryOptions.maxFilterNodes` (additive).
  0.11.1 → 0.12.0.
- `@suluk/effect`'s `mergeSlices` now merges `ok` field-by-field, not atomically. 0.14.1 → 0.14.2.
- All 5 `registry/services/todo/*.ts` files stripped of prose comments and dead/duplicate type declarations;
  `todo.schema.ts`'s `.zod()`/`.meta()`/`.describe()` calls are UNCHANGED (runtime schema declarations that drive
  validation + the OpenAPI doc, not comments).
- `registry/services/todo/README.md` rewritten — it was several generations stale (wrong file→target mapping,
  referenced `effectPipeRoute`, a primitive C100's "DSL diet" removed entirely) and didn't mention C114's
  list-query surface at all.
- Full ecosystem sweep: zero fail, zero typecheck errors across 46 packages.

Pairs with `plan/facts/0todo-declarative-cleanup.bn`.
