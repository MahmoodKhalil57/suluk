# C44. `x-suluk-cost` settlement axis — how a declared cost is recovered (credit | rate-limited | free)

> **Provenance:** Candidate-fork ADR (Suluk), not a SIG decision. Adds a FIFTH orthogonal axis to the cost facet,
> `CostSettlement` (`@suluk/cost`), declaring HOW the operator recovers a declared cost. Operator-surfaced: *"allow the
> user to define how the cost will be paid — by rate limiting or by credit."* It is also a real **cowpath**: the
> toolfactory CI/CD audit already checks "every cost names a lever — `credit | rate-limit | free`" in its app-specific
> `src/openapi-governance`; this promotes that into a first-class, Suluk-derived facet (the C027/C036 cowpath pattern).

Date: 2026-06-30

## Status

Accepted (candidate-fork). Decision ceiling **0.55** — Originated, but it formalizes a deployed cowpath and is fully
witnessed. Ledger: [`0settlement.bn`](../../../plan/facts/0settlement.bn) (burhan True, converge clean). **No core
change** — `CostModel` lives in `@suluk/cost`; core treats `x-suluk-cost` structurally and the matcher already ignores
it, so the new axis is trivially D1-safe (static facts on an already-matcher-invisible facet).

## Context

The cost facet had four orthogonal axes (C024–C026): `basis` (how it meters), `trigger` (when it fires), `attribution`
(who pays), `reconciliationBasis` (declared vs actual). What it could not say is **how the operator recovers the cost**
— and that is precisely the free-vs-paid distinction every consumer hand-rolls. toolfactory is the proof: its free tools
are gated by **rate-limiting** (the cap *is* the price) and its paid features **debit credits** (`CreditsDb`), and its
governance gate hand-checks that every cost "names a lever". Declaring the lever on the contract lets `@suluk/cost`
**derive** the audit (and, downstream, the enforcement), removing per-route boilerplate.

## Decision

1. **`settlement?: CostSettlement` on `CostModel`** — `method: "credit" | "rate-limited" | "free"`, plus
   `credits?` (the per-call debit for `credit`; omitted ⇒ derive from `estimateMicroUsd` × the operator's credit rate, a
   runtime concern) and `overflow?: "deny" | "credit"` (what happens when a `rate-limited` free cap is exhausted).
   - **`rate-limited`** = free to the user; the cost is paid by CAPPING usage, so the op's `x-suluk-ratelimit` *is* the
     settlement. **`credit`** = the user pays credits (a balance is debited). **`free`** = truly free.
2. **`settlementAudit(doc)`** — the generic form of the "names a lever" check: a priced op with no settlement
   (`cost-without-settlement`), `rate-limited` with no cap (`rate-limited-without-cap`, HIGH — nothing to be the
   payment), `credit` with neither `credits` nor an estimate (`credit-without-amount`), `free` yet priced
   (`free-but-priced`, the operator absorbs it).
3. **`impliedErrorStatuses(req)`** — the generic form of toolfactory's errors-gate: a request's facets IMPLY error
   responses a contract should declare — `credit`→**402**, authenticated/admin→**401**, owner-scope→**403**,
   rate-limit→**429**, an upstream `per-request` cost component→**502**. A pure function of the declared facets.
4. **`settlementRollup(doc)`** — a "how is this API monetized" tally (credit / rate-limited / free / priced-but-unsettled).

## D1 / wall

`settlement` is an enum + an integer + an enum — purely static facts, never a request value or a payload pointer. It
lives on `x-suluk-cost`, which the matcher has ignored since C024 (cost is advisory; `buildAda`/`matchRequest` never
read it). A type-linked test classifies every `CostSettlement` field as enum/scalar (a value-extracting field would fail
to compile until classified — the C037 claim-2 discipline). No new D1 surface; no core change.

## Consequences / honesty

- **Ceiling 0.55.** Witnessed: the axis, `settlementAudit`'s four rules, `impliedErrorStatuses`' facet→status mapping,
  and the rollup ([`cost/test/settlement.test.ts`](../../../tooling/ts/packages/cost/test/settlement.test.ts), cost 43 pass).
- **Built vs derived:** the DECLARATION + the audits are built; the **enforcement** is the consumer's runtime — the
  rate-limit middleware already ships in `@suluk/hono`, and the credit debit is a thin adapter over the app's balance
  store (an adapter seam, like stubgen). The `estimateMicroUsd → credits` conversion rate is a runtime concern, not
  declared here.
- **Feeds the next step:** `settlementAudit` + `impliedErrorStatuses` are two of the dimensions the unified contract
  audit (extending `@suluk/cockpit`'s `contractGates`) will compose, collapsing toolfactory's governance + errors gates.
