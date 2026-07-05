# C103 — the `HttpStatusCode`/`HttpStatus` fix: a precise status vocabulary, used at the field it belongs to

> **Provenance.** A Suluk *candidate* decision (codename `asl-ojs`), authored by the single contributor, grounded in
> burhan/daftar/mizan — **not** a Moonwalk SIG decision. Operator-driven (2026-07-05): *"fix all issues to use the
> new HttpStatusCode properly and update specification/candidate-v4/v4-meta-schema.json as per our changes in
> tooling/ts/packages/core/src/types.ts."* Corrects an ungoverned, undocumented concurrent-session edit to
> `core/src/types.ts` that had been flagged as an unrelated regression across three prior ADRs (C100, C101, C102).

**Status:** BUILT + VERIFIED. Full 30-package ecosystem sweep: **zero typecheck errors, zero test failures**
(the one remaining `@suluk/admin` test failure is pre-existing and unrelated — confirmed via `git stash` in C102).
This is the FIRST clean sweep since the regression was first observed.

## Context

A concurrent, undocumented edit had added an `HttpStatusCode` interface to `core/src/types.ts` (numeric status code
→ semantic name, e.g. `200: "ok"`, `404: "notFound"`, plus `"5XX"`/`"default"`) with **zero doc comment and zero
ADR reference** — inconsistent with every other addition in that file. It was applied in two ways:

1. **`Response.status: keyof HttpStatusCode`** — a genuine improvement (a precise literal-status enum replacing
   the old open `string | number`). But it silently DROPPED the quoted-string numeric form (`"200"`) that real code
   depends on: `@suluk/cockpit`'s `diffContracts` has an explicit, passing test asserting `status: 200` and
   `status: "200"` are the SAME status, never drift; `@suluk/scalar`'s test suite constructs `status: "200"`
   extensively.
2. **`Record<HttpStatusCode[keyof HttpStatusCode], Response>`** applied to the FOUR response-map fields
   (`Request.responses`, `Components.responses`, `PathItem.pathResponses`, `OpenAPIv4Document.apiResponses`) — this
   indexes by `HttpStatusCode`'s **values** (the semantic names — "ok", "notFound", …), requiring an EXHAUSTIVE
   `Record` with all ~60 names present on every map. Every real response map in the codebase is sparse and
   author-named (`{ ok: {...}, notFound: {...} }`, not all 60 keys) — this broke `tsc` across 14+ packages, first
   noted in [C100]'s closing note, still present (and slightly wider) through [C101] and [C102].

## Decision

**Keep `HttpStatusCode` — it's a real improvement — but fix where it's used.**

1. **The four response-map fields revert to `Record<string, Response>`** (free-form author-chosen names, sparse) —
   exactly what the meta-schema already validated all along (it was never touched by the original bug) and what
   every real usage in the ecosystem needs.
2. **A new derived `HttpStatus` type**: `keyof HttpStatusCode | \`${Extract<keyof HttpStatusCode, number>}\`` —
   the numeric code, its EQUIVALENT string form, `"5XX"`, or `"default"`. `Response.status: HttpStatus` (not
   `keyof HttpStatusCode` directly) — this is the ONLY field `HttpStatusCode` should ever have constrained; it's a
   VALUE lookup, not a map-key constraint. `HttpStatusCode` now carries a proper doc comment stating exactly that.
3. **The precision was carried through to where status codes are actually authored**, not just patched at the
   point of failure: `@suluk/hono`'s `RouteResponse.status` (`HttpStatus`) and `errors?` (`Extract<HttpStatus,
   number>[]`), `@suluk/effect`'s `HttpErrorClass.status`/`httpError()`'s status param/`AnyHttpError.status`/
   `HttpSuccess.status`/`respond()`'s status param/`DEFAULT_SUCCESS_STATUS`/both `ok?.status` declarations (route.ts
   + suluk-fn.ts), and `@suluk/drizzle`'s local `ok`/`bare` response-builder helpers in `crud.ts` — all now typed
   against `HttpStatus`/`Extract<HttpStatus, number>` instead of a bare `number`. This is the actual point of
   introducing `HttpStatusCode`: an author who writes `errors: [999]` or `httpError("X", 999, schema)` now gets a
   compile error instead of a silently-wrong document.
4. **`specification/candidate-v4/v4-types.ts`** (the spec mirror) gained the same `HttpStatusCode`/`HttpStatus` +
   `Response.status: HttpStatus` — verified to compile standalone.
5. **`specification/candidate-v4/v4-meta-schema.json`**: `Response.status`'s validation replaced the old
   pattern/range approximation (`oneOf: [string pattern "^([1-5][0-9X]{2}|default)$", integer 100–599]` — which
   accepted codes NOT in the registered set, e.g. 199 or 250) with an **exact enum** mirroring `HttpStatus`
   precisely: one `oneOf` branch of the 60 registered integer codes, one branch of their string forms plus `"5XX"`/
   `"default"`. The four response-map fields needed NO meta-schema change — they were never broken there.

## Consequences

- The whole ecosystem typechecks clean for the first time since the regression was introduced — 30/30 packages,
  0 errors, 0 unrelated-to-this-fix test failures.
- A handful of test-only fixes were needed where a bare object literal or a no-return-type-annotated helper widened
  a status literal (`200`) to `number` — `@suluk/core`'s `test/facets.test.ts`, `@suluk/agents`'s
  `test/patterns.test.ts`, `@suluk/hono`'s `test/route-group.test.ts` — each pinned with `as const` or an explicit
  parameter type, zero behavior change.
- A new `test/http-status.test.ts` in `@suluk/core` locks: `HttpStatus` accepts number/string-number/`"5XX"`/
  `"default"` and rejects an unregistered code (both as `@ts-expect-error` type assertions and as real
  `validateDocument` runtime checks against the updated meta-schema); the four response maps stay genuinely sparse.
- **Nothing about the normative response-map shape changed** relative to before this whole saga (C013–C098) — this
  is a correction back to the long-standing, meta-schema-verified design, not a new decision about how responses
  are keyed.

Pairs with `plan/facts/0http-status-vocabulary-fix.bn`. Fully resolves the regression flagged in C100/C101/C102.
