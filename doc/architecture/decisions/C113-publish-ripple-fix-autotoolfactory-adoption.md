# C113 — publish the C099-C112 arc; fix a real cross-package dependency-range ripple; adopt in autotoolfactory

> **Provenance.** A Suluk *candidate* decision (codename `asl-ojs`), authored by the single contributor, grounded in
> burhan/daftar/mizan — **not** a Moonwalk SIG decision. Operator-driven (2026-07-05): continuing *"bump everything
> and commit and push, then use in todo registry with autotoolfactory"* after C112's review-and-fix pass. Covers
> the npm-publish step itself, a real ecosystem-coherence bug it surfaced, and the live adoption in autotoolfactory.

**Status:** DONE + VERIFIED. All 33 affected packages published (16 direct C099-C112 bumps + 16 dependency-range
ripple-fixes + 1 second-order ripple-fix). Autotoolfactory regenerated from the published `@suluk/platform@0.19.0`,
fresh-installed, `tsc` 0 errors. Two pre-existing, unrelated gaps (a BDD-coverage test, a conformance grade)
confirmed identical before/after via `git stash` — not introduced by this adoption.

## Two real bugs found and fixed during this step

**1. The Bash tool does not persist shell state between separate invocations.** `NPM_SULUK_TOKEN` lives in `.env`;
the repo's `tooling/ts/.npmrc` reads it via npm's own `${NPM_SULUK_TOKEN}` interpolation syntax, which requires the
variable to be present in the environment npm actually runs in. Sourcing `.env` in one Bash call and running
`npm publish` in a *separate* call left the variable unset in the second call's fresh shell — npm silently
resolved the interpolation to an empty string, producing a confusing `401`/`404` that read exactly like an
expired/misscoped token (and was initially misdiagnosed as one). The fix is mechanical but easy to miss: `source
.env && export VAR && <command that needs VAR>` must be **one** Bash invocation, every time. Operator confirmed via
the npm token-management UI that the token itself was valid, bypasses 2FA, and scoped to `@suluk/*` all along —
which is what forced the correct diagnosis.

**2. A 0.x-semver MINOR bump silently fragments a real npm-published ecosystem.** This monorepo treats a 0.x minor
bump as its "breaking changes allowed" line (consistent with every prior ADR's own "BREAKING" framing at a minor
version). Internally, every package depends on its siblings via `workspace:^`, which always resolves to whatever's
in the local workspace — so this fragmentation is **structurally invisible** inside the monorepo; the full 30-
package ecosystem sweep run after every change in C104-C112 could never have caught it. But `workspace:^` gets
REWRITTEN to a real caret range (`^<version-at-pack-time>`) the moment a package is packed for npm — and under
semver, `^0.a.b` excludes `0.(a+1).0`. Bumping `@suluk/core` 0.1.14→0.2.0 (and `@suluk/drizzle` 0.8.0→0.9.0)
therefore silently excluded every ALREADY-PUBLISHED package still declaring the old `^0.1.x`/`^0.8.x` range — 16 of
them (`agents`, `better-auth`, `billing`, `chat`, `openapi-compat`, `cost`, `credits`, `deploy`, `editor`,
`journeys`, `reference`, `scalar`, `swagger`, `testgen`, `visual`, and a second-order case, `keys`→stale
`better-auth`). This was invisible until a REAL consumer (autotoolfactory) did a real `npm`-registry install and
TypeScript saw two structurally-different `OpenAPIv4Document` types from two different physical `@suluk/core`
installs (a classic dual-package-version nominal-collision). **Fix**: a generic, recursive coherence checker (query
every published package's own declared `@suluk/*` dependency ranges against every published package's actual
current version; flag any `^0.a.b` that excludes a currently-published `0.(a+1).c`) surfaced the exact list;
patch-bumping + republishing each (no source change needed — `workspace:^` auto-widens the baked-in range to the
current local version at pack time) closed every gap. One genuinely pre-existing, unrelated inconsistency
(`@suluk/stripe` → stale `@suluk/payments`, from the C048-era) was found by the same checker and deliberately left
alone — `stripe` isn't a dependency of autotoolfactory or anything touched in this arc.

**Lesson for any future 0.x minor bump in this ecosystem**: run the recursive coherence checker (or its
equivalent) against every published package immediately after publishing, not just the ones directly touched —
the ripple is invisible from inside the workspace and only surfaces on a real external install.

## Publish order (topological, executed exactly as ordered)

Wave 1 (the C099-C112 arc itself): core → zod → hono → mcp → panel → provision → nano-stores → shadcn → drizzle →
effect → builder → harden → sdk → cockpit → admin → platform.

Wave 2 (the ripple-fix, dependency-range widening only): openapi-compat → {agents, billing, chat, cost, credits,
deploy, journeys, reference, testgen, visual} → {better-auth, scalar, swagger} → editor.

Wave 3 (second-order ripple, discovered only after wave 2 via the recursive checker): keys.

## Autotoolfactory adoption

Regenerated via the INSTALLED `@suluk/platform@0.19.0` generator (`bun run generate` → `suluk-platform`), not
hand-edited — matching the established C051/C053 one-shot-generator proof pattern. Real diffs: the three
previously hand-pinned `@suluk/*` deps (drizzle/effect/journeys, plus hono) reverted to `"latest"` per the
generator's own current `resolveVersion` policy (a stale historical pin from an early manual adoption commit,
predating that policy); `src/app.ts` gained the full C111/C112 drizzle-`.policy()`/`queryKind` seam; `src/services/
todo.ts` lost its raw `effect`/`zod` imports (C112's layering fix, `confirmDeleted` moved to the model layer); a
new `scripts/emit-asyncapi.ts` (C099's capability, now reflected by the generator, inert until a module populates
event facets); `src/db/todo.ts`/`src/routes/todo.ts` diffs are pure prettier reformatting from running the
freshly-copied registry source through autotoolfactory's own formatter — zero semantic change. `tsc`: 0 errors
(after the ripple-fix; 8 errors before it, all the duplicate-`@suluk/core`-version symptom). Committed locally in
autotoolfactory (no remote configured there — a purely local project, so no push).

## Consequences

- 33 packages published across this whole step; the full `@suluk/*` ecosystem is now cross-dependency-coherent
  (one pre-existing, unrelated gap deliberately left: `stripe`→`payments`, out of scope, unused downstream).
- Two durable, non-obvious operational lessons captured in memory for future sessions (Bash-tool env-var scoping;
  the 0.x-minor-bump ripple + its generic recursive-checker fix).
- Autotoolfactory is a live, verified, up-to-date real-world proof of the entire C099-C112 arc — `tsc` clean, zero
  regressions in either of its two pre-existing (unrelated) known gaps.

Closes the operator's full request: reviewed, fixed, bumped, committed, pushed, published, and adopted.
