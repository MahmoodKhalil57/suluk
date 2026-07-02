# C067 — Token-cost economy: infra weights bubble up, providers weigh in, the calculator nets per-user

> **Provenance.** A Suluk *candidate* decision (codename `asl-ojs`), authored by the single contributor, grounded in
> burhan/daftar/mizan — **not** a Moonwalk SIG decision. Operator-driven (2026-07-02). Builds on
> [C024](C024-cost-trigger-and-attribution.md) (cost trigger/attribution), [C044](C044-cost-settlement-axis.md) (settlement
> = how a cost is recovered), and the C057–C058 platform/deploy arc (Cloudflare-native single-environment).

**Status:** BUILT + PROVEN E2E (local, with the real merged weight table) + unit-tested. Confidence ceiling **0.70** — the
mechanism is proven and the Cloudflare *meter → µ$* math is exact, but the *pricing values* are a harvested snapshot (one data
bug already found + fixed, below) and the provider marginal rates are list-price approximations, so the absolute dollar figures
carry a real-world-accuracy caveat even though the arithmetic is sound.

## Context

The cost model already had the shape — a per-operation `x-suluk-cost` facet (C024/C026) with components + `estimateMicroUsd`,
a settlement axis (C044: credit | rate-limited | free), a ledger (`summarize`/`principalCost`), and a metering path
(`computeCost`). What it lacked was a *ground*: every µ$ was **hand-typed** ("a db-read costs 10 µ$"), so the numbers were
guesses that drifted from reality and never re-priced when infrastructure pricing changed. The operator's ask: make the cost
of **every route and event** *derive* from a real pricing payload, in **tokens that map 1:1 to dollars** (1 token = 1 µ$;
$1 = 1,000,000 tokens); let the shadcn registry declare **cost multipliers** (what infra a route uses) and its **payment
method**; give **other providers** (Stripe, Resend, Google) the same treatment; ship a **built-in calculator** that answers
"spin up a test user — what did he cost us, minus what he paid in?"; and have **harden** incentivise declaring cost + payment
type, because per-user cost observability is a strong metric even when the user never pays directly.

## Decision

**1 — Infra weights (the ground).** `@suluk/cloudflare/pricing` reads the Cloudflare pricing payload and exposes it as a
**weight table** — `meter → µ$/unit` (`overage_usd / (overage_per ?? 1) × 1e6`), with an alias layer (`d1.read` →
`durable-objects.rows_read`, …) and `weighInfra(usage)` → tokens + a breakdown + surfaced unknown meters (never silently
zeroed). This is the *pricing payload* the whole economy is grounded in.

**2 — Bubble-up.** The weights flow **cloudflare → deploy → the app**: `@suluk/deploy` re-exports `weightTable`/`weighInfra`/…
from `@suluk/cloudflare/pricing` (it already owns the Cloudflare target, so one import gives a consumer both shipping *and*
costing). `@suluk/cost` stays infra-agnostic — it never depends on `@suluk/cloudflare`; weights are **passed in**. The join
point is `@suluk/cost` `mergeWeights(...tables)` — CF infra + each provider's fee weights → one table (later tables win, so an
operator override passed last takes precedence).

**3 — Static vs dynamic.** `CostModel.infra` (`{ meter: units }`) is the **cost multiplier**: weighed against the table to the
**STATIC** token floor (`weighCost`). **DYNAMIC** cost — per-token, per-mb, a % third-party fee — stays in `components` with a
metered basis and is priced per request against actual usage (`computeCost`). A route's total = static floor + metered dynamic.

**4 — Providers weigh in (same treatment).** Each provider package exports its fee weights as plain data merged into the table:
`@suluk/payments` `STRIPE_WEIGHTS` (`stripe.charge` = 300,000 µ$ = the fixed $0.30; the 2.9% is dynamic via `stripePercentFee`),
`@suluk/email` `RESEND_WEIGHTS` (`resend.email` ≈ 400 µ$), `@suluk/better-auth` `AUTH_WEIGHTS` (`google.oauth` = 0 — Google
Sign-In is free; the real login cost is D1 infra; carried as a declared meter for observability + as the paid-Google-API
extension point).

**5 — Payment methods.** `SettlementMethod` extended: `credit | rate-limited | free | subscription | trust | lead`. Settlement
is **orthogonal** to metering — it changes only *how the cost is recovered*, never *whether it's tracked*. All six are still
cost-tracked in tokens; rate-limit budget is a **separate, non-$ currency** (the "payment" for rate-limited routes).

**6 — The registry declares it.** `@suluk/builder`'s `ModuleCost` gains `infra?` + `settlement?`; `crudCost` emits infra
multipliers + a `credit` method on every CRUD op; the billing/ecommerce/crm/preview modules declare theirs inline
(subscription for plan ops, credit for the rest, free for the dev-preview login). `@suluk/hono` `RouteContract.cost`
(a full `CostModel`) already carries `infra` + `settlement`, so RouteContract routes get the same expressiveness for free.

**7 — The calculator.** `@suluk/cost` `simulateUser(principal, steps, weights)` is the "spin up a test user" harness:
each step weighs its static infra + meters its dynamic usage into one cost event × N; `userEconomics` nets it —
`net = cost − paid`, with rate-limit budget tracked apart. Cost attributes **by provider** (`stripe`/`resend`/`google` vs
`cloudflare`) so the trace is honest about where the money goes.

**8 — Harden incentivises it.** `@suluk/harden` `auditCost(doc)` is a **third** grading dimension (beside security +
readiness, foldable via `combineGrades`): `cost-undeclared` (MEDIUM — an op with no `x-suluk-cost`, so per-user cost can't be
tracked) + `cost-without-payment` (HIGH — a *priced* op that names no settlement). Grade = clean / examined ops.

## Proven (this session)

End-to-end with the **real merged table** (CF `weightTable()` + Stripe + Resend + Google): a test user's month (113 events —
logins, 50 contact-list reads, 20 creates, 10 emails, 2 × $20 checkouts, one $20 credit purchase) → **cost $1.764**
(attribution: **stripe $1.760**, **resend $0.004**, **cloudflare $0.0001**), **paid $20**, **net −$18.24 (a margin)**. The
honest headline: raw Cloudflare infra for this workload is *near-free*; the real per-user cost is the third-party providers.
`auditCost` on a mixed doc correctly grades **F** and flags the priced-no-method + undeclared ops. Green: cost 52, cloudflare
38, harden 28, builder 103, payments 28, email 18, better-auth 48, deploy 17 — all tsc-clean.

## Honestly-low ceiling (0.70)

The **mechanism** is proven and the CF *meter → µ$* arithmetic is exact, but the **pricing values** are a harvested snapshot:
this session already found + fixed a real data bug (four R2 operation meters had `overage_per: 1` instead of `1000000` — R2 ops
are priced per-million — a 1e6× overstatement that made a demo read "$45" for a cent's worth of ops). Other meters may carry
similar harvest errors; a full pricing-payload audit is deferred. The provider marginal rates (Resend ~400 µ$/email, the
Stripe split) are **list-price approximations**, and free-tier absorption is a settlement concern layered on top, not in the
marginal weight. So trust the *shape* and the *relative* attribution; treat the *absolute* dollar figures as good-faith
estimates pending a pricing audit + real-account reconciliation.
