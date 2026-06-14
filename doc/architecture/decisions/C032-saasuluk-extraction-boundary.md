# C32. Where consumer logic lives — the saasuluk→suluk extraction boundary (mechanism down, policy up)

> **Provenance:** Candidate-fork ADR (Suluk), not a SIG decision. Decides which logic in the saasuluk *consumer*
> app belongs in a reusable `@suluk/*` package vs the app, and the day-2 economics that govern *when* to move it.
> Decided by the **persona council** (deliberation `wf_f7f3c841-ed4`, 2026-06-14, day-2-reframed): library-maintainer
> + starter-consumer + platform-architect + devex-pm roles, expansionist↔minimalist↔conservative dispositions. The
> council is **calibrated for OpenAPI-spec decisions, not library-boundary ones** — a guide, not ground truth.
> Mapped 34 candidates; first wave implemented across `@suluk/{email,stripe,harden,cloudflare}` (see the
> [parity roadmap](../saastarter-parity-roadmap.md) Extraction-wave section for commits).

Date: 2026-06-14

## Status

Accepted (candidate-fork). Decision ceiling **0.70** — the council transfers from spec-decisions to library-boundary
decisions only by analogy (eliminate-duplication, push-complexity-to-layers, keep-the-common-case-overridable), so
its predictive calibration does not apply here; the *boundary principles* are validated by the disk-verified
"completing-half" cases, the *new-package shapes* are an N=1 bet capped lower (≈0.78–0.82).

## Context

saasuluk re-derived, or hardcoded, logic that is generic mechanism: the Resend send `@suluk/email` already shipped,
the fetch impl + webhook verifier `@suluk/stripe` left as a typed hole, the hardening transform that answers
`@suluk/harden`'s own audit, the production `RateLimitStore` `@suluk/hono` only stubbed, two hand-copied CRUD driver
twins (sync bun:sqlite / async D1), and a divergent dev-vs-prod webhook verifier.

**Day-2 economics (binding to this decision):** the packages are pre-1.0 (`0.1.x`), saasuluk is the sole consumer,
and both repos are edited in one commit. There is **no versioning/semver tax and no migration tax** — an extraction
is just a code move, whose cost is lowest now and only rises as consumers and surface accrete. The minimalist's
"every package is a dependency + a versioning commitment" brake is therefore void today; the only real brakes are
genuine genericness, customizability, and correctness.

## Decision

Logic is placed by these principles (council-converged):

1. **Mechanism down, policy + data + copy up.** The package owns the correctness skeleton or protocol adapter
   (CAS-once transitions, edge HMAC verify, fixed-window counter, form-encoding, schema-floor transform, DDL emit,
   dispatch shell, render engine). The app keeps the spec it shows off — status/transition tables, the access
   `POLICIES` matrix, the `VALIDATIONS` map, the `ENTITIES` registry, rate budgets, brand/copy, the deploy plan —
   as injected config/callbacks/data that stay visible and overridable.
2. **Completing-half first.** Where a package already owns the *type/interface* but the app re-derived the *impl*
   (a `StripeLike` with no fetch, a `RateLimitStore` with no prod backing, an audit with no transform, an unused
   `webhookRouter`), genericness is already proven — these are the near-free, highest-value, lowest-risk moves.
3. **Parity-by-construction, not by vigilance.** Logic that exists as two hand-copied twins, or two divergent code
   paths for one operation, must collapse to one shared impl parameterized at the edge (async executor, injected
   fetch, store, db resolver). Treat a comment like *"matching the dev server so dev/prod never diverge"* as a
   defect marker, not a reassurance.
4. **Pure-function / port-driven surface, never a do-everything sender.** Ship params-builders + verifiers +
   port-driven orchestrators + declarative-config renderers; the app keeps the network call, the row, the URLs.
5. **Don't over-extract on N=1** (the only real day-2 brake): app-policy keyed by the app's own names is policy, not
   mechanism — a second app would never install it. Lone exception: a concurrency-correctness skeleton (the money
   CAS machine) extracts eagerly *despite* N=1, behind an injected port with characterization tests — re-deriving a
   money-path race is exactly the bug a library exists to prevent.
6. **Correctness gate on the money path.** Anything touching the once-only CAS gates must be pinned by a
   characterization test (once-only + dual-instance parity) *before* the code moves, then run byte-identical after.

Corollary kept-decisions: `collectAssets` stays app-side (the `@suluk/cloudflare` `deploy()` is deliberately
pure-over-injected-bytes — the disk-reading wrapper is the intended app seam); the entity/validation/budget
registries + seed + catalog stay app-side as policy/data.

## Consequences

- The app shrinks toward a thin, legible composition root (registries + config + copy); reusable mechanism accrues
  in the packages, which get more *complete* (gaps filled) and more *proven* (a real consumer exercises them).
- New packages proposed by the map but **not yet built** (gated on need/test): `@suluk/commerce` (the CAS order
  machine, test-first), `@suluk/access` (the `gate()` engine, or fold into `@suluk/hono`), `@suluk/cron`.
- The day-2 window is finite: once a second consumer or a 1.0 lands, the versioning brake returns and extractions
  get costlier — which is the argument for doing the mechanical, disk-verified ones now.
- Ceiling 0.70 reflects that the boundary is a guide; revisit per-candidate against a second consumer when one exists.
