# C45. The unified contract audit — `@suluk/cockpit` `conformanceGates`

> **Provenance:** Candidate-fork ADR (Suluk), not a SIG decision. Grows `@suluk/cockpit`'s ship-readiness checklist with
> a `conformanceGates(doc)` that COMPOSES the shipped readiness audits — harden (security + readiness, C043), cost,
> settlement (the lever, C044), and the implied-error check — into the SAME `Gate[]` model as `contractGates`. The
> generic form of toolfactory's hand-rolled `conformance-gate` (which folds contract + errors + governance + stores +
> hardening into one pass). Decided during the toolfactory CI/CD-consolidation investigation; the operator chose
> **extend cockpit's `contractGates`** (over a new `@suluk/ci` package) and **C044 first**.

Date: 2026-06-30

## Status

Accepted (candidate-fork). Decision ceiling **0.55** — Originated, composition-only (no new audit logic), fully
witnessed. Ledger: [`0audit.bn`](../../../plan/facts/0audit.bn) (the C043 unified-audit ledger, extended). No new facet,
no new D1 surface — every dimension is a downstream audit.

## Context

toolfactory's CI runs six thin gate scripts (~154 LOC) over the merged contract — contract, conformance (a 5-in-1 pass),
cost, errors, governance, stores — backed by ~150 LOC of generic audit rules in its app `src/`. Every one of those rules
is now a shipped Suluk primitive: `validateDocument` (core), `auditDocument`/`auditReadiness` (harden, C043),
`costAudit`/`settlementAudit`/`impliedErrorStatuses` (cost, C044). `@suluk/cockpit` already owns the "are you ready to
ship?" checklist (`contractGates` → `Gate[]` → `shipSummary`) and already depends on cost + agents + core. The missing
piece is a single composition that folds the readiness dimensions into that checklist — so a consumer's CI collapses to
one call.

## Decision

`conformanceGates(doc): Gate[]` in `@suluk/cockpit` — five gates, each composed from a shipped audit, in the existing
`Gate` model (`ok`/`warn`/`error`/`todo`):

1. **`hardened`** ← `auditDocument(doc)` (input hardening grade → status).
2. **`readiness`** ← `auditReadiness(doc)` (computed-required / missing-example grade → status).
3. **`costed`** ← `costAudit(doc)` (cost completeness).
4. **`settled`** ← `settlementAudit(doc)` (every priced op names a lever — the generic governance check, C044).
5. **`errors`** ← per-op `impliedErrorStatuses(req)` vs the op's declared statuses (the generic errors-gate, C044).

A grade maps to a status (A/B ok · C/D todo · F error); findings map by severity (high/error → error, else todo). Plus
**`assertConformance(doc)`** — the CI gate: throws if any conformance gate is an `error` blocker. A consumer's whole CI
becomes `shipSummary([...contractGates(doc, baseline), ...conformanceGates(doc)])` or `assertConformance(doc)`. cockpit
gains a `@suluk/harden` dependency (acyclic: `examples` ← `harden` ← `cockpit`); it never depends on journeys — BDD
coverage folds in upstream via harden's `combineGrades` (C043).

## Consequences / honesty

- **Ceiling 0.55**, composition-only. Witnessed: the five gates over a dirty + a clean contract, and `assertConformance`
  throwing on an error blocker ([`cockpit/test/conformance.test.ts`](../../../tooling/ts/packages/cockpit/test/conformance.test.ts), cockpit 131 pass).
- **Bounded:** v1 composes harden + cost + settlement + implied-errors. **Composable follow-ons:** a stores-coherence
  dimension (the C037 reactive surface), an agent-grade dimension (`assertAgentGrade`, cockpit already deps agents), and
  an SDK-drift gate (regenerate + compare). These slot in as more gates without changing the shape.
- **What stays in toolfactory:** the gate *runner* (worktree CI harness), deploy/provision, and the genuinely
  app-specific audit rules (the cost *matrix*, error exemptions). The contract-derivable rules move here; the business
  policy stays. The headline LOC reduction is the right ~25%, governed in Suluk — not raw bulk.
