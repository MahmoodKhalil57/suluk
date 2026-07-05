# C109 — fix the three pre-existing errors; verify the v4 spec mirror against `@suluk/core`

> **Provenance.** A Suluk *candidate* decision (codename `asl-ojs`), authored by the single contributor, grounded in
> burhan/daftar/mizan — **not** a Moonwalk SIG decision. Operator-driven (2026-07-05): *"fix all existing errors and
> generate specification/candidate-v4/v4-meta-schema.json and v4-types.ts from
> tooling/ts/packages/core/src/types.ts."* Two parts: (1) three issues flagged as pre-existing/out-of-scope across
> C102–C108's own sweeps, now actually fixed rather than flagged; (2) a field-by-field verification that the spec
> mirror is current.

**Status:** BUILT + VERIFIED. Full 30-package ecosystem sweep: zero typecheck errors, zero test failures (previously
two typecheck errors + one test failure). `specification/candidate-v4/conformance/run.py`: all 8 checks pass.

## Part 1 — the three fixes

- **`@suluk/nano-stores`'s `successSchema`** (`src/stores.ts`) compared `RouteResponse.status` (typed `HttpStatus` —
  a union of numeric literals AND their string form, plus `"5XX"`/`"default"`) directly against numeric literals
  with `>=`/`<`, which TS correctly rejects (TS2365: relational operators need matching primitive categories).
  **Fixed** by normalizing with `Number(r.status)` before the range check — the same idiom already used at
  `@suluk/hono`'s `emit.ts:256` and `@suluk/cockpit`'s `conformance.ts:28` for the identical C012 numeric/string
  status equivalence. `Number("5XX")`/`Number("default")` are `NaN`, so the wildcard tokens are naturally excluded
  from the 2xx range — no behavior change beyond accepting the string form of a 2xx status.
- **`@suluk/example-petshop`'s `drizzleHandlers`** (`src/store.ts`) typed its table parameter as a hand-rolled
  `Table & { id: Column }` — a loose approximation of a SQLite table. `@suluk/drizzle`'s `inline-zod.ts` (C09x)
  module-augments the ACTUAL `drizzle-orm/sqlite-core` `SQLiteTable` interface with a required `zod`/`zodSchema`
  member (a real `sqliteTable(...)` result carries it on its prototype at runtime); since example-petshop imports
  `@suluk/drizzle` transitively (`entities.ts` → `tableToV4`), that augmentation is visible in its own `tsc`
  program, and the loose `Table & {id}` stand-in stopped satisfying `SQLiteTable<TableConfig>`'s now-required
  `zod` member. **Fixed** by typing the parameter against the real `SQLiteTable<TableConfig> & { id: Column }`
  (imported from `drizzle-orm/sqlite-core`) instead of the generic `Table` — the real `pet`/`category` tables
  (built via `sqliteTable(...)`) already satisfy it structurally, so the one call site's existing
  `as Parameters<typeof drizzleHandlers>[0]` cast needed no change.
- **`@suluk/admin`'s "the deploy page renders the Cloudflare plan" test** asserted `"wrangler login"`/
  `"wrangler deploy"` — text from BEFORE the C059 de-wrangler migration (`@suluk/cockpit`'s `deployPlan` has said
  `"bun run deploy"` / `"no wrangler CLI"` / never `"wrangler login"` since C059 shipped). The test was simply
  never updated when the renderer changed underneath it. **Fixed** by asserting the current, real strings
  (`"bun run deploy"`, `"no wrangler CLI"`) instead of the stale ones.

None of the three needed new design — each was a real, narrow root-cause fix (a normalization idiom already used
elsewhere in the ecosystem; the correct upstream type instead of a hand-rolled stand-in; a test updated to match
its already-shipped subject).

## Part 2 — spec-mirror verification (no changes needed)

Read `tooling/ts/packages/core/src/types.ts` in full (1825 lines) against `specification/candidate-v4/v4-types.ts`
(478 lines) and `v4-meta-schema.json` (159 lines), field by field. Core's file has THREE non-normative regions,
each explicitly marked (own doc-comment header): the `x-suluk-*` vendor facets interleaved with the normative
model (`SulukResource`/`SulukStore`/`SulukRunNode`/`SulukRunGraph`/`SulukJob`/`SulukAgent`/`SulukPolicy`/etc.,
lines ~104–553 and the `Request` vendor fields at 749–778), CloudEvents/AsyncAPI (C100, line 1236+), and OSB/
provisioning (C101, line 1500+). Every NORMATIVE interface/type — `OpenAPIv4Document`'s core shape, `Info` through
`Tag`, `PathItem`/`Shared`, `HttpMethod`/`HttpStatusCode`/`HttpStatus`, `Request`'s core fields (vendor facets
excluded), `ParameterSchema`/`Response`/`Header`/`Link`/`Example`/`Callback`/`Components`, the `SecurityScheme`
family (C099), `Reference`, and the full C099 JSON-Schema model (`SchemaBase` through `Static`/`isReference`) —
already matches `v4-types.ts` exactly, field-for-field. The one non-mirrored member, `SchemaProperty`/
`PropertyFacets` (core lines 1180–1186, a property-level facet-locus HELPER type for consumers like
`@suluk/drizzle` to type "this subschema may carry an `x-suluk-*` key" — see C102), is judged intentionally
excluded: it is not part of `OpenAPIv4Document`'s structural closure (nothing in the document model requires it),
and its entire purpose is describing where a vendor facet may attach — the same category of thing the mirror
already excludes everywhere else. `v4-meta-schema.json` was independently re-verified via the conformance harness
(`run.py`, all 8 checks) rather than by hand-diffing every JSON Schema field, since that harness IS the executable
spec of "does this meta-schema accept/reject what the model says it should."

**Conclusion: no drift existed.** "Generate v4-types.ts/v4-meta-schema.json from core/types.ts" resolves to a
verified re-confirmation of an already-correct mirror, not a content change — consistent with the normative/
non-normative split every ADR since C099 has reinforced. No new file, no generator script was built; a hand-authored
mirror with a byte-level verification pass is the established pattern here (C099–C103 did the same).

## Consequences

- Zero content changes to `specification/candidate-v4/v4-types.ts` or `v4-meta-schema.json`.
- Three real bugs fixed across `@suluk/nano-stores`, `@suluk/example-petshop`, `@suluk/admin` — each previously
  flagged "pre-existing, out of scope" across C102–C108's own sweeps, now closed.
- Full 30-package sweep: zero errors, zero failures (down from two typecheck errors + one test failure).
- `specification/candidate-v4/conformance/run.py`: all 8 checks still pass.

Pairs with `plan/facts/0fix-existing-errors-verify-spec-mirror.bn`.
