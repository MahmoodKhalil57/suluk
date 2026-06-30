# C46. Runtime extraction plan — `@suluk/credits` · `@suluk/keys` · `@suluk/billing`

> **Provenance:** Candidate-fork ADR (Suluk), not a SIG decision. A **decomposition PLAN**, not an implementation:
> operator-surfaced *"a lot of toolfactory's credit and billing (minus topup-subscription pooling and refund logic),
> logging, and api-key is pretty generic and should be folded into Suluk packages."* Mapped by a code survey of
> toolfactory's runtime; the operator chose **"hold — record the plan as an ADR first"** (build in a fresh session).
> Distinct from C043–C045 (the CI/audit layer): this is the **runtime library** layer.

Date: 2026-06-30

## Status

Accepted as a **PLAN** (candidate-fork). Decision ceiling **0.4** — designed from a code map, **unbuilt + unwitnessed**
(no package exists yet). Ledger: [`0runtime-extraction.bn`](../../../plan/facts/0runtime-extraction.bn) (burhan True,
converge clean). **Not a contract-facet change** — these are app-runtime libraries; they never touch `buildAda`/
`matchRequest`, so there is no D1 concern. The numbers below are from the survey and must be re-confirmed at build time.

## Context

The map of toolfactory's four runtime subsystems (credits, billing, logging, api-keys) found **~1,200 LOC genuinely
generic** vs ~400 LOC app-specific. The generic logic is exactly the kind that should live under Suluk's discipline
(tests, ledger, ADRs) and be reused by every app — not copy-pasted. The operator drew the app/generic line precisely
(exclude topup-subscription *pooling* + *refund workflow* + pricing policy).

## Decision — three packages, an adapter seam, a fixed order

Each package is **generic logic + an injected handle** (a DB / Stripe / env adapter the app supplies — the proven
`@suluk/deploy`/stubgen seam), so the package owns the schema + logic and the app owns the connection + the policy.

1. **`@suluk/credits`** (~240 LOC + ~110 logging) — the metered ledger. **Moves:** balance; the **atomic
   `debitIfCovers`** (the conditional-INSERT CAS that closes the concurrent-charge window); idempotent debit
   (`debitOnceIfCovers`/`debitOnceAttributed`, the double-spend guard); per-key spend (`keySpend`); the transaction log;
   `addCredits`/`debitCredits`; `adminStats`; the **activity-log query** (bucketed timeseries + recent events, scoped to
   a key's subtree — logging is a read-side projection over the ledger, so it lives here). **Schema:** `credit_transaction`
   + `credit_amount` + `credit_key`. **Stays app-specific:** the **payment-alert kinds** (toolfactory's
   `subscription_past_due` etc.). **Extends:** `@suluk/drizzle`. **The dependency ROOT** (keys + billing both need it).

2. **`@suluk/keys`** (~449 LOC — **100% generic**, the cleanest extraction) — hierarchical API keys. **Moves:** the
   permission/scope model; key listing + per-key usage; the **delegation chain** (`resolveChain` + ancestors); the
   **effective-caps** derivation (scope ⊆ parent, cap = min, expiry = soonest); the **pooled subtree headroom**
   (`chainHeadroom` over a materialized path — a parent cap bounds the parent+children *total* spend, the abuse-proof
   primitive); **cascade** expiry/disable/revoke (`revokeKeyTree`); lineage management; the auth middleware (verify →
   resolve chain → set `keyId`/`keyChain` context). **Schema:** `keyLineage` (+ the `@better-auth/api-key` plugin
   schema). **Stays app-specific:** the *concrete* scope names + cap *values*. **Extends:** `@suluk/better-auth` +
   `@suluk/drizzle`. **Pairs with** `@suluk/credits` (per-key spend via the `credit_key` sidecar).

3. **`@suluk/billing`** (~335 LOC) — Stripe plumbing. **Moves:** checkout / PaymentIntent / SetupIntent; subscription
   CRUD (`getSubscriptionStatus`/`setSubscriptionCancel`/`changeSubscriptionPlan` mechanics); payment methods
   (list/set-default/detach); **refund *mechanics*** (`listRefundableCharges`/`refundAcrossCharges` — idempotent walk);
   tax calculation; account linking; `chargeOffSession`; the portal session. **Stays app-specific (the operator's
   exclusions):** the **webhook *dispatch*** (event routing + the credit-grant business logic), the **pricing matrix**
   (COGS/markup/tiers/packs/refund-haircut — `pricing.ts`), **alerts + email** (copy/templates), and the
   **subscription-pooling + refund *workflow*** (when/to-whom). **Extends:** `@suluk/stripe` + `@suluk/drizzle`; depends
   on `@suluk/credits` (for the injectable idempotent grant).

**Build order:** `@suluk/credits` → `@suluk/keys` → `@suluk/billing` (dependency-driven). Logging is part of credits.

## Consequences / honesty

- **Ceiling 0.4 — a PLAN, not code.** The LOC + boundaries are from a survey; re-confirm each at build time.
- **Building the packages is additive + safe** (new, test-witnessed). **Rewiring toolfactory's LIVE credit/billing to
  use them is the riskier, SEPARATE step** — do it only after each package is byte-faithful to the extracted logic and
  unit-witnessed; treat the live-billing cutover with care (idempotency + the atomic-debit CAS are load-bearing for
  money-correctness).
- **Sequence with the audit layer:** C045's `conformanceGates` already governs the *contract*; these packages govern the
  *runtime*. The two meet at C044 settlement (the contract declares the lever; `@suluk/credits`/`@suluk/keys` enforce it
  — the rate-limit middleware already ships in `@suluk/hono`, the credit debit becomes a thin call into `@suluk/credits`).
- **Deferred to the build session:** the exact adapter-seam interface per package (the DB-handle shape), the Drizzle
  schema ownership (package-owned vs app-declared), and whether `@suluk/keys` wraps or re-exports the `@better-auth/api-key`
  plugin.

## Build log (the plan, executed)

The plan was built across five Steps; the ceiling lifted from 0.4 (designed) to ~0.55 (built + witnessed) per package.

- **#1–#3 `@suluk/keys`** — the delegation-chain *algebra* (effectiveCaps / **pooledHeadroom** — the abuse-proof subtree
  cap / clampChildGrant / read-time revocation cascade), the materialized-path utilities + scopes, then the lineage DB ops
  + the **keys × credits** integration (`chainHeadroom` joins the credit ledger so the pooled cap is real end-to-end).
  Witnessed: keys 22 pass.
- **#2 `@suluk/credits`** — the metered ledger (package owns the schema; app injects a Drizzle handle). The money-OUT
  core: the **atomic `debitIfCovers`** (can't drive the ledger negative under concurrency) + the idempotent
  `debitOnceIfCovers` (partial-refund double-spend guard). Witnessed against a real bun:sqlite.
- **#4 `@suluk/billing` v1** — the Stripe transport (with the refund idempotency-key) + customer/intent creation + the
  saved-card surface. The Effect-`Schema` defensive decode dropped → no `effect` dep. Witnessed with a mock fetch.
- **#5 `@suluk/billing` v2 (the deferred wrappers FINISHED) + `@suluk/credits.grantOnce`** — `2026-07-01`. The remaining
  deferred surface extracted, each entanglement resolved by a **seam**:
  - **money-moving** (`payments.ts`): hosted Checkout (one-time + subscription), the billing portal, the on-default-card
    top-up, and the off-session auto-top-up charge — the app's **product name + success/cancel/return URLs injected as
    params** (no app routes/branding baked in); the off-session decline taxonomy preserved verbatim
    (`authentication_required` → an `authRequired` flag; a hard 402 *returned* not thrown; a transient failure *throws*).
  - **Stripe Tax** (`tax.ts`): `calculateTax` / `recordTaxTransaction`, graceful (any failure → `taxCents: 0`, the top-up
    always proceeds).
  - **pricing-woven subscription logic** (`subscriptions.ts`): made **generic over a `SubPlan` catalog the app passes** —
    `planById`/`planByPrice` over the injected `SubPlan[]`, a `SubscriptionBranding` seam for the Product/lookup_key, the
    **pure `ceilingFor`** paid-ceiling math, and `ensurePlanPrice` / `createSubscriptionOnDefaultCard` /
    `getSubscriptionStatus` / `changeSubscriptionPlan` (the *up→down→up never-recharge* invariant intact).
  - **the billing-account store** (`account.ts`): package-**owned** `billing_account` schema (userId PK as a plain column;
    app injects the Drizzle handle, exactly like credits/keys); `linkBillingCustomer` never clears a subscriber's sub.
  - **`creditOnce` landed in its right home** — `@suluk/credits.grantOnce`, the money-**IN** idempotent grant (legacy-key
    honoured; non-finite / fractional / non-positive deltas rejected) — the money-IN twin of `debitOnceIfCovers`.
  - **Stays app (policy, not library — honest):** the **webhook *dispatch*** (it composes `@suluk/stripe`'s
    `webhookRouter` / `verifyStripeSignature` + these primitives + `grantOnce` + the app's pricing/alerts), the **branded
    email templates**, the **payment-alert kinds**, and **refund + subscription-pooling** (operator-excluded from the
    start). Deps += `@suluk/drizzle` + `drizzle-orm`. Witnessed — billing **29 pass**, credits **14 pass**, both tsc-clean.

**The library layer is DONE.** The only remaining C046 work is the **toolfactory rewiring** (the live-billing cutover) —
the separate, careful step this ADR always flagged: do it only after each package proves byte-faithful, because the
atomic-debit CAS + the idempotent grant/debit are load-bearing for money-correctness.
