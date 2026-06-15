# Contributing to the `@suluk/*` packages — when, and how

The whole point of Suluk is that reusable mechanism lives in the packages and **apps stay thin**. So an agent working
in a consumer app (saasuluk, or any app) should be *continuously alert* to logic that wants to move into a package —
and equally disciplined about what should NOT. Ground truth: [C032 extraction boundary](doc/architecture/decisions/C032-saasuluk-extraction-boundary.md)
and the [parity roadmap](doc/architecture/saastarter-parity-roadmap.md) "Extraction wave" + "Structural waves".

## The mantra: adopt-by-default · extend-by-evidence · create-rarely

- **Adopt** the package's common case before writing anything.
- **Extend** an existing package when generic mechanism is missing — *with evidence* it's mechanism, not policy.
- **Create** a new package only when no existing one can host the capability without becoming incoherent. The bar is
  high: a first pass at parity proposed ~16 new packages; **only 3 survived scrutiny** (`email`, `i18n`, `theme`).
  Every later structural move *extended* an existing package; the three further proposed packages
  (`commerce`/`access`/`cron`) all proved unnecessary — the primitives fit `@suluk/hono` (gate) + `@suluk/drizzle`
  (CAS). **Favor extending over creating.**

## When to SUGGEST contributing (the triggers)

Raise it the moment you notice any of these in app code:

1. **You're writing generic mechanism in the app.** If the logic would be useful to *another* Suluk app and isn't
   specific to this one's policy/data, it's mechanism → it belongs in a package. *Mechanism down, policy up.*
2. **A package owns half the capability.** It ships the audit but not the transform; the type but not the adapter; the
   router but you're dispatching by hand. → **complete the other half *in the package*** (the "completing-half-first"
   principle). The app filling a package's gap by hand is the loudest signal.
3. **The same logic is duplicated.** Across dev/prod instances, or across two apps. Duplication of mechanism = a
   missing package export. (The dev/worker CRUD "twin" was exactly this — collapsed into one `@suluk/drizzle` factory.)
4. **You had to reach past a package's public API** (monkey-patch, copy-and-tweak an internal). The escape hatch you
   needed is a seam that belongs upstream — add the option/port to the package.
5. **A facet is declared but unenforced/untested.** Add the enforcement primitive (`@suluk/hono`) + the conformance
   claim (`@suluk/testgen`) so the facet becomes load-bearing.

## Gate every suggestion on three axes (C032 day-2 framing)

Versioning cost is ~zero pre-1.0, so the decision is NOT "is it worth the version churn" — it's purely:

1. **Genericness** — is it *mechanism* (reusable beyond this app), not policy/data/an N=1 registry?
2. **Customizability** — can it expose a clean override/port surface (overridable defaults, injected deps, pure
   functions) so adopters don't have to fork it?
3. **Correctness** — is it tested? For money/auth/state-machine paths, is there a **characterization or conformance
   test written *first*** so the move is provably behavior-preserving?

If all three pass: extract while malleable (cost only rises later). If any fails: keep it in the app, or fix the gap
first. A clean pure-function/port surface is itself part of the bar — don't extract something that can only work by
reaching back into the app.

## When NOT to extract (the brakes — over-extraction is a real failure)

From C032 §5 / the parity roadmap's "Kept app-side":
- **N=1 policy / the *machine*.** The race-safe *skeleton* (CAS) is generic; the order/money *state machine* that uses
  it is this app's policy — keep it app-side.
- **Trivial app-coupled glue.** A 3-line `{...row}`+delete redaction bound to this app's column list is too small and
  too coupled to warrant an export.
- **Showcase legibility.** Some uniform 1-liners are better kept *visible* in the reference app than hidden behind an
  import (no correctness driver).
- **Data / registries.** `ENTITIES`/`VALIDATIONS`/`RATE_LIMITS`/catalog/seed are app policy+data, not mechanism.
- **Over-abstraction.** Don't wrap something already correct (e.g. a `defineCron` over the worker's working
  `scheduled()`).

## The contribution recipe (once a suggestion passes the gate)

1. **Find the home.** Extend the *closest* existing package. New package only if it would otherwise distort an existing
   one. **Never create a dependency cycle** — e.g. the CRUD factory went in `@suluk/drizzle` (which already deps
   `@suluk/hono`); the reverse would cycle. The access engine went in `@suluk/hono` as a sibling of `enforceAccess`.
2. **Complete halves in place.** If a package half-owns it, finish it there (audit → also ship the transform).
3. **Gate correctness first.** For money/auth/state paths: write the characterization/conformance test, confirm it
   passes on *current* behavior, then move the code, then confirm byte-identical. Add `@suluk/testgen` claims for new
   facets.
4. **Keep it Workers-safe & pure** (see `standards.md` §4) — injected ports, no Node-only APIs, await-transparent.
5. **Publish + adopt:** bump → `bun publish` → bump the consumer dep → `bun install --force` → confirm the consumer's
   tests + a live smoke still pass.
6. **Record it.** Emit a `Cxxx` ADR if the boundary is hard-to-reverse or surprising (like C032/C033). Update
   `doc/architecture/saastarter-parity-roadmap.md` (the extraction/structural tables) so the surface evolution isn't
   left behind. Keep the package `README` current.

## How to phrase the suggestion to the user

Be concrete and bounded: name the logic, name the target package, state which axis it passes, and estimate the move in
*hours* (not weeks — most of it is research + a small diff + tests). Example: *"`refundOrder`'s once-only guard is
generic CAS mechanism (genericness ✓, pure ✓); the money machine around it stays app-side. I'd add `claimOnce` to
`@suluk/drizzle` behind a characterization test, then have the app adopt it — ~1–2h. Want me to?"*
