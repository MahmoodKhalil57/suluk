# C102 — the adoption pass: reflecting C099/C100/C101 into @suluk/zod, drizzle, effect, hono, platform, provision + 10 other dependents

> **Provenance.** A Suluk *candidate* decision (codename `asl-ojs`), authored by the single contributor, grounded in
> burhan/daftar/mizan — **not** a Moonwalk SIG decision. Operator-driven (2026-07-05). Follows
> [C099](C099-typed-json-schema-model.md)/[C100](C100-cloudevents-asyncapi-model.md)/[C101](C101-osb-provision-facet.md) —
> those landed the three typed companion models in `@suluk/core`; this pass makes the ecosystem actually USE them.

**Status:** BUILT + VERIFIED across the whole ecosystem. Every touched package's `bun test` suite is green; a
full 30-package typecheck + test sweep confirms zero regressions (the ONE pre-existing test failure, in
`@suluk/admin`, is unrelated — confirmed via `git stash` isolation). Not all audit findings were applied — several
were tested and REJECTED after verification (see "What didn't survive verification" below).

## Context

Operator: *"review our core changes and make sure to reflect them to suluk/zod suluk/drizzle suluk/effect
suluk/hono suluk/platform suluk/provision etc."* C099–C101 added three typed companion models to `@suluk/core`
(JSON Schema, CloudEvents/AsyncAPI, OSB/provisioning) but most of the ~30 dependent packages still read/wrote the
old loose `Record<string, unknown>` shapes locally — the core types existed but weren't reflected outward.

Grounded via a 7-agent parallel audit (one per named package + one broad sweep of the remaining ~24 core
dependents), each required to cite real `tsc`-verified before/afters, not just propose changes. The audit
surfaced ~30 candidate findings rated HIGH/LOW/NONE; only HIGH-rated, `tsc`-confirmed findings were implemented.

## Decision

**Genuine wiring completions (not just type tightening):**

- **`@suluk/hono`'s `EmitContext` gained a `provision` field** — `emitV4({..., provision})` now stamps
  `document["x-suluk-provision"]`, mirroring the existing `securitySchemes` → `components.securitySchemes` pattern
  exactly. This is the missing half of C101: previously `x-suluk-provision` could only be hand-set on a document
  after the fact; now it's a first-class emit-time input.
- **`@suluk/platform`'s `buildProvisionConfig` additively calls `deriveInstanceSpecs(apiDocument())`** when the app
  has a `contract` service, merged alongside every module's hand-authored `InstanceSpec[]` fragment — mirroring the
  already-shipped `buildEmitContract`/`buildEmitAsyncApi` pattern in `ci.ts` exactly (`import { apiDocument } from
  "./src/contract"`). Inert until a module populates `x-suluk-provision` (deriveInstanceSpecs returns `[]` on an
  empty facet), so every existing generated app's `provision.config.ts` changes only by the addition of an always-
  empty extra array element — proven via the golden-fixture regeneration (`UPDATE_GOLDEN=1 bun test golden`).

**Type tightening (loose → precise, zero behavior change, each verified with a real `tsc --noEmit` run):**

- `@suluk/zod`: `ZodToV4Result.schema` and the internal `JSchema` alias now use core's `SchemaObject`/`Schema`
  (added `@suluk/core` as a real dependency — previously had none); `LEXICAL_V4_SCHEMA` gained `satisfies Schema`
  (a `satisfies` clause, NOT a `:` annotation — verified the annotation form breaks the package's own test file's
  literal-shape property reads).
- `@suluk/hono`: `zParam()`'s return type, the auto-derived path-parameter schema, and two now-redundant
  `as unknown as Schema` double-casts (made possible by C099's `OpaqueSchema` member).
- `@suluk/provision`: `derive.ts` dropped a redundant local cast now that `OpenAPIv4Document` declares
  `x-suluk-provision` directly.
- Ten further packages (`shadcn`, `harden`, `mcp`, `sdk`, `cockpit`, `builder`, `admin`, `panel` ×2) had a locally
  hand-duplicated `Schema`/`SecurityScheme`/`Request` shape swapped for the real core type, or a redundant cast
  removed now that the surrounding value was already precisely typed.

## What didn't survive verification (the discipline this pass is really about)

Several audit-proposed changes were tried and **rejected** after direct `tsc` verification, not applied blindly:

- **`SchemaObject`'s `.required`/`.properties` collapse to `any`/`unknown` when read off the WIDE union** (9
  members), even though every INDIVIDUAL member types them precisely — a real TypeScript resolution limit for
  this many-membered union, confirmed by isolating each member in a scratch probe. `@suluk/admin`'s
  `render-data.ts` and `@suluk/panel`'s model/fields needed a small targeted local cast at the read site; `@suluk/
  compat`'s `downgrade.ts` was found to ALREADY have the necessary casts (the audit's claim that they were
  "provably redundant" did not hold up — verified they resolve to `unknown`, not a precise type, so removing them
  would have been a regression, not a cleanup). `downgrade.ts` was left unchanged.
- **Bracket access on an `x-suluk-*` vendor-facet key** (`schema["x-suluk-widget"]`) fails the same way — TS can't
  distribute a template-literal index signature across this many-membered union via bracket notation, even though
  every member individually supports it (verified in `@suluk/shadcn`'s `spec.ts`). Fixed with a local
  `as Record<string, unknown>` cast at the specific facet-read sites — the same pattern core's own
  `SchemaProperty` type already documents as the intended escape hatch.
- **`hardenSchema`'s generic bound** needed `SchemaOrRef` (not `Schema`) — its real callers pass values that may be
  a bare `$ref` (a `Reference`), which the function's runtime already no-ops on safely; constraining to `Schema`
  alone broke real call sites, caught immediately by `tsc`.
- **`@suluk/effect`**: both this pass's own audit AND C101's original ADR independently concluded a per-route
  `x-suluk-provision` attach point should NOT be added yet (no per-op facet exists on `RouteContract` for it, and
  building one now would fragment the authoring surface before the document-level form has a single live
  consumer). Two independent audits converging on the same "don't build this yet" is itself the load-bearing
  signal, not a data point to override.
- **`@suluk/drizzle`**: genuinely nothing applied — already correctly wired to `Schema` (`schemas.ts`), and
  `SchemaProperty`/`PropertyFacets` was checked against `inline-zod.ts`'s `$ref`-stamping and found NOT to fit
  (`$ref` isn't an `x-suluk-*`-prefixed key, so it doesn't satisfy `SchemaProperty`'s index signature — confirmed
  by `tsc`, not assumed).

## Consequences

- `@suluk/core`'s three companion models are now genuinely load-bearing in the ecosystem, not just available.
- The C101 loop is closed end-to-end at the MECHANISM level (facet → `emitV4` stamp → `deriveInstanceSpecs` →
  generated `provision.config.ts`) — though still zero live consumers (no registry module authors
  `x-suluk-provision` yet; this pass makes it possible, not adopted).
- A durable, empirically-grounded lesson surfaces for future work against `SchemaObject`: reading `.required`/
  `.properties`/any `x-suluk-*` bracket key off the WIDE union needs a local cast; reading `.type`/`.format`/
  `.enum`/other simple named keywords does not. Worth remembering before "simplifying" a cast on this type again.
- **Flagged, not fixed** (same as C100/C101): the unrelated concurrent-session `HttpStatusCode`-keyed `Record`
  regression is still present and, if anything, slightly wider (99 error lines across 14 packages at this pass's
  final sweep, up from ~96 previously) — confirmed via full content inspection that zero of them relate to this
  pass's changes. A second, independent pre-existing failure was also newly observed and confirmed unrelated: one
  `@suluk/admin` test asserting deploy-page copy ("wrangler deploy") that no longer matches the rendered output —
  isolated via `git stash` to a concurrent edit outside this pass's files.

Pairs with `plan/facts/0core-adoption-pass.bn`. Builds on C099/C100/C101.
