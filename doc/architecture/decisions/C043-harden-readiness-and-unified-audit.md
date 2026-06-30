# C43. Readiness as a harden dimension + the unified `journeys audit`

> **Provenance:** Candidate-fork ADR (Suluk), not a SIG decision. Operator-surfaced: *"shouldn't the gaps/outlines be
> surfaced by `@suluk/harden` and then we use it in the packages we are working on today?"* — yes: `@suluk/harden` is
> already the unified contract-grade surface (it ships `combineGrades`/`assertCombinedGrade`, designed to fold its own
> input-schema grade together with `@suluk/agents`' `gradeAgent`). This adds a **readiness** dimension to harden and a
> **coverage** dimension to journeys, and a `journeys audit` that folds security + readiness + coverage into one grade.

Date: 2026-06-30

## Status

Accepted (candidate-fork). Decision ceiling **0.55** — Originated, but built on harden's existing, blessed combinator and
witnessed end-to-end. Ledger: [`0audit.bn`](../../../plan/facts/0audit.bn) (burhan True, converge clean). No new facet —
all downstream audits.

## Context

The C040/C041 work introduced two things a contract can now be **audited** for, beyond input-hardening: a request field
that is `computed`/`readOnly` yet `required` (a client can't send it — a real bug), and a request with no curated
example. Plus the journeys binder already computes **BDD coverage** (which ops have no scenario). The operator's question
is the right architectural one: don't scatter these as ad-hoc reports — fold them into `@suluk/harden`, which already
**is** the grading surface. The one hard constraint: harden depends only on `@suluk/core`, and `@suluk/journeys` depends
on harden, so **harden cannot import journeys** (a cycle) and has no `.feature` files — so BDD coverage must be computed
in journeys and combined by **letter**, exactly as the agent grade already is (`combineGrades` takes letters, not deps).

## Decision

1. **harden gains `auditReadiness(doc)` — a SECOND, separate grade** (`src/readiness.ts`), kept apart from the security
   `auditDocument` grade so a security score never mixes with a readiness score. Two schema-fact rules, now expressible:
   **`computed-required`** (high — a required `computed`/`readOnly` field) and **`request-without-example`** (low). It
   reuses harden's `Finding`/`grade` machinery and reads origin through `@suluk/examples`' `fieldOrigin` (the single
   source of the C041 convention — harden gains a zero-dep `@suluk/examples` dependency; no cycle).
2. **journeys gains `coverageGrade(report)`** (`src/coverage.ts`) — turns the binder's covered/total into a letter (using
   harden's `grade`) and surfaces the uncovered op names (the "gaps" — generate a Scenario Outline for each). It lives in
   journeys because coverage needs the features; journeys gains a `@suluk/harden` dependency.
3. **`journeys audit` + the pure `buildAudit(docText, featureTexts?)`** fold the three dimensions via harden's existing
   **`combineGrades`**: `combineGrades([security, readiness, coverage])` → worst + average. `--min A|B|C|D|F` gates CI on
   the **worst** dimension (the safe value). Coverage is included only when `--features` is given. The outline
   **generator stays in journeys**; the audit surfaces *which* ops need one.

## Layering / D1

`@suluk/examples` (zero-dep) ← `@suluk/harden` ← `@suluk/journeys` — acyclic; harden never imports journeys (it folds a
letter). No new facet, no matcher interaction — every piece is a downstream audit/consumer of the contract. The readiness
rules read only schema facts (`required`, `x-suluk-origin`/`readOnly`, `examples`), never request values.

## Consequences / honesty

- **Ceiling 0.55.** Witnessed: `auditReadiness` (both rules + grade), `coverageGrade`, `buildAudit`, and the `audit` CLI
  end-to-end (a real spawn: three dimensions + a combined grade + the `--min` gate). Built on harden's proven combinator.
- **Bounded honestly:** readiness is two schema-fact rules, not exhaustive; an "unmarked-but-likely-sourced" heuristic
  finding is deferred (too fuzzy — every field defaults to `input` legitimately). Security and readiness are deliberately
  separate grades (combined by letter), never one mixed score.
- **Use in the packages today:** `journeys audit` is the one-stop readiness surface; toolfactory CI can
  `assertCombinedGrade`/`journeys audit --min B`. **Deferred:** wiring the gate into toolfactory CI; an `outlines`
  subcommand that emits stubs for exactly the uncovered ops the audit names.
