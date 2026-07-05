# C116 — three real bugs found (and fixed) while adversarially verifying the C113–C115 adoption into autotoolfactory

> **Provenance.** A Suluk *candidate* decision (codename `asl-ojs`), authored by the single contributor, grounded in
> burhan/daftar/mizan — **not** a Moonwalk SIG decision. Operator-driven (2026-07-05): *"update ATF todo service to
> use our latest C113 to C115 changes."* Adopting those changes into `~/apps/autotoolfactory` (a separate,
> non-burhan-governed generated app) surfaced three real, independently-confirmed defects via an 8-agent
> verification workflow (5 live-HTTP service-cluster sweeps + 3 adversarial reviewers — security, correctness, code)
> run against a live `bun run dev` instance. All three are fixed here, at the source, and re-verified.

**Status:** BUILT + VERIFIED. `@suluk/effect` **154/154** tests pass (2 strengthened). Full 46-package ecosystem
sweep: zero fail, zero typecheck errors. The two live-reproducible bugs were reproduced via direct `curl` against
the running dev server BEFORE the fix and confirmed resolved (safe fallback, no 500) AFTER — not just unit-tested.

## Bug 1 (correctness, C114 follow-up) — a dataType/op-mismatched filter throws past the "never a 500" guarantee

`registry/services/todo/todo.model.ts`'s `listTodos` wrapped only `parseListQuery(raw, todo, LIST_OPTS)` in a
try/catch (to absorb a malformed *ADVANCED* `filter=` JSON payload). `compileFilter(todo, lq.filter)` — called
immediately after, OUTSIDE that try/catch — throws a plain `Error` when a filter's `op` is valid in the general
13-op vocabulary but invalid for the *target column's* `dataType` (e.g. `contains` on the boolean `completed`
column, `gt` on the string `title` column) — this is C114's own documented, INTENTIONAL "loud thrown error, never a
silently dropped or misapplied clause" behavior in `compileFilter` itself. The model never caught it. Reproduced
live: `GET /api/todos?completed__contains=true` → HTTP 500 with the raw `Error` message. **Not** a cross-user data
leak (verified repeatedly — the 500 never contained another user's rows), but it directly contradicted the model's
own doc comment ("a malformed ADVANCED filter is caught and treated as no-filter... rather than surfacing as an
uncaught 500") and the C114 ADR's stated guarantee, in BOTH simple-mode (`completed__contains=true`) and
advanced-mode (`filter={"field":"completed","op":"contains",...}`).

**Fix:** widen the try/catch to wrap the WHOLE where-clause construction — `parseListQuery` **and**
`compileFilter` **and** `compileTextSearch` **and** `compileSort` — falling back to the same safe default (owner-
scoped, unfiltered, newest-first, default page size) for ANY failure in that chain, not just a JSON-parse failure.
Verified directly (a throwaway bun:sqlite script, mirroring the C114 verification style): the two live-reproduced
inputs now return the caller's own rows unfiltered instead of throwing; a valid filter (`title__contains=milk`)
still narrows correctly.

## Bug 2 (security/hardening, cross-cutting — NOT todo-specific) — `effectRoute` leaks the raw defect to the wire

`tooling/ts/packages/effect/src/route.ts`'s handler, on an undeclared failure or a DEFECT (`Effect.die`/an untyped
throw — a handler "can always die"), returned
`toProblemDetails({ tag: "PayloadOperationError", detail: Cause.pretty(exit.cause) })` — embedding the FULL pretty-
printed cause, including absolute server file paths and internal package call sites (`node_modules/@suluk/drizzle/
src/query.ts:291:42`, `effect/dist/esm/internal/core-effect.js:423:5`), into the client-facing Problem Details
`detail` field, **unconditionally, in every environment** (no dev/prod gate). This is precisely the failure mode
`@suluk/hono`'s own `onError` handler (`tooling/ts/packages/hono/src/on-error.ts:29-32`) explicitly guards against
— "an untyped throw is a defect — never leak it," logging server-side and returning a generic, detail-less body —
but `sulukRoute`'s own handler (built on `effectRoute`) returns its response before Hono's `onError` is ever
reached, so that established, correct policy never applied to any Effect-based route. **Every route in every
Suluk-built app** (not just `todo`, not introduced by C113-C115 — the bug pre-dates this whole arc, only *surfaced*
by Bug 1 handing an adversarial reviewer a live, reproducible defect to poke at) leaked this way on any uncaught
defect.

**Fix:** mirror `@suluk/hono`'s policy exactly — log the cause server-side (`console.error`) and return
`toProblemDetails({ tag: "PayloadOperationError" })` with no `detail`. Two existing tests ("a DEFECT (die) → 500
Problem Details, surfaced not swallowed" and "a NON-httpError defect still collapses to a 500 ProblemDetails
(surfaced, not leaked)") asserted only `status === 500` — their own names already claimed "not leaked" without
checking it. Both strengthened to assert `body.detail` is `undefined`.

## Bug 3 (completeness, C115 follow-up) — Better Auth's own drizzle instance bypasses `guardTransactions`

C115 wired `guardTransactions` into `registry/foundation/app/app.ts`'s `DbLive` — the ONE place every
`queryOne`/`queryMany`/`mutate`-mediated model gets its `Db`. But `registry/services/auth/auth.ts`'s `buildAuth`
constructs its OWN, separate `drizzle(env.DB)` instance for Better Auth's `drizzleAdapter` — entirely independent
of `DbLive`, so it was never guarded. Confirmed (via direct source read + a grep across the installed
`better-auth` adapter) that better-auth's own adapter has zero `.transaction()` call sites today, so this was not
an active break — but it left the exact same silent-dev/silent-break-in-prod trap C115 exists to close, just on a
different, equally foundational construction site (auth is the module every other module ultimately depends on).

**Fix:** wrap `auth.ts`'s `drizzle(env.DB)` in `guardTransactions(...)` too — a one-line, zero-behavior-change
closure of the gap.

## Two flagged, OUT-OF-SCOPE findings (real, but pre-existing and unrelated to C113–C115)

The same verification pass surfaced two more genuine issues, confirmed via `git log`/`git status` in
`~/apps/autotoolfactory` to predate this regeneration entirely (untouched files) — **not fixed here**, flagged for
a deliberate future decision:

- **`GET /api/openapi.json` never reflects a signed-in session caller's real access** — it always projects the
  public-only surface (identical to an anonymous request), because `enforceApiKeyScope` only restricts KEYED
  callers and no `roleScopes` map is wired for session principals in this generated app's `auth.ts`/`contract.ts`.
- **`GET /api/admin/stats` returns 200 with real platform financial aggregates to a fully anonymous caller** — the
  `admin` scope requirement is not enforced for session/anonymous callers at all (same root cause as above), a
  genuine information-disclosure gap in the generated app's authorization wiring, worth its own decision.

## Consequences

- `@suluk/effect` 0.14.0 → 0.14.1 (bug fix, non-breaking — strictly removes leaked information from an error
  response no caller should have depended on).
- `@suluk/drizzle` 0.11.0 → 0.11.1 (docstring precision only — clarified that `SulukCache.onMutate` is invoked by
  drizzle on every write regardless of `.$withCache()` opt-in, even though it is currently a true no-op; no
  behavior change).
- `registry/services/todo/todo.model.ts`, `registry/services/auth/auth.ts` updated (flow to consumers via
  `shadcn add`/`bun run generate`, not npm).
- Full ecosystem sweep: zero fail, zero typecheck errors across 46 packages.
- Re-adopted into `~/apps/autotoolfactory`: dependencies updated, regenerated, both live-reproduced bugs confirmed
  fixed against the running dev server, full verification workflow re-run clean.

Pairs with `plan/facts/0adversarial-verify-fixes-atf-adoption.bn`.
