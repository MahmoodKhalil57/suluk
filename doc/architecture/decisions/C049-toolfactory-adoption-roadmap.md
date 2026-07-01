# C49. Toolfactory adoption roadmap — dogfooding C038→C048

> **Provenance:** Candidate-fork ADR (Suluk), not a SIG decision. Operator-surfaced: *"I want to think about how we will
> implement everything in toolfactory from C038 to now."* Operator chose **plan only** (record the roadmap; build later).
> This is the *consumer* side of the C038–C048 arc: toolfactory is the reference app that proves the packages under real
> (money-bearing) load. Companion to the release that published 14 `@suluk/*` packages (2026-07-01).

Date: 2026-07-01

## Status

**SUPERSEDED by [C051](C051-platform-generator-autotoolfactory.md)** (2026-07-01) — the operator chose to *leave
toolfactory alone* and generate a fresh parity app (`autotoolfactory`) instead of migrating toolfactory in place, which
retires this roadmap's risky live money-cutover (Phase C). C049's module map + phase content is still the useful survey;
its *in-place migration* approach is not the path. Originally: accepted as a **ROADMAP** (plan only — no code this pass). Ceiling **0.5** (designed from a code survey; the per-module
LOC/mapping is re-confirmed at build time). Ledger: [`0toolfactory-adoption.bn`](../../../plan/facts/0toolfactory-adoption.bn)
(burhan True). **Not a contract-facet change** — an app-adoption plan; never touches the matcher.

## Context

toolfactory is already a **partial dogfood**: it deps `@suluk/{core,cost,harden,journeys,sdk,stripe,testgen,better-auth,
cloudflare,drizzle,email,env,hono,mcp,reference}` and ships `api/journeys/*.feature` BDD suites. The C038–C048 arc built
the packages that supersede its remaining **hand-rolled** runtime, provisioning, and audit code. Adoption = replace that
code with the packages, in **risk order**, so the money-critical cutover is never rushed. Everything the arc produced is
now on npm (this release), so toolfactory can consume real versions.

## Decision — three phases, lowest-risk first

### Phase A — audit + BDD (low risk, non-money)
| toolfactory | → package (ADR) |
|---|---|
| `scripts/ci-*.ts`, `checklist-gate.ts` | `@suluk/cockpit` `conformanceGates` / `assertConformance` (C045) |
| `api/journeys/*.feature` (+ `adversarial/`) | `@suluk/journeys` `audit` / `demos` / `promote` (C040/C042/C043) |
| the readiness/settlement/errors CI checks | `@suluk/harden` `auditReadiness` (C043) + `@suluk/cost` `settlementAudit` (C044) |

Proves the loop end-to-end with zero money risk. Start here.

### Phase B — provisioning (medium risk, infra)
| toolfactory | → package (ADR) |
|---|---|
| `scripts/provision.ts` (D1 + Pages) | `@suluk/provision` `cloudflareD1` / `cloudflarePagesDomain` (C047) |
| `scripts/provision-kv.ts` / future R2 | `cloudflareKv` / `cloudflareR2` |
| `scripts/provision-domains.ts` (async certs) | `cloudflarePagesDomain` (last-operation poll) |
| `scripts/mint-*.ts` (scoped tokens) | `cloudflareToken` |
| `scripts/sync-secrets.ts` | `cloudflareSecrets` + the `@suluk/env` sink |
| the run itself | one `provision.config.ts` + `generate`/`migrate` (a committed migration history) |

Infra-correctness-sensitive but reversible (`plan`/dry-run first, `protected` on D1). Collapses ~700 LOC of scripts.

### Phase C — runtime (HIGH risk, money) — its own dedicated, parity-tested pass
| toolfactory | → package (ADR) |
|---|---|
| `api/src/credits.ts` | `@suluk/credits` (`getBalance` / atomic `debitIfCovers` / idempotent `grantOnce` / `keySpend`) |
| `api/src/key-lineage.ts` + `apikeys.ts` | `@suluk/keys` (`effectiveCaps` / `pooledHeadroom` / `chainHeadroom` / `revokeKeyTree`) |
| `api/src/billing.ts` + `pricing.ts` | `@suluk/billing` + `@suluk/payments` (connector + client-token surface; pricing primitives) |

## Consequences / honesty

- **Phase C is the money cutover every C046/C048 ADR flagged as the separate careful step** — the atomic-debit CAS, the
  pooled-headroom cap, and the idempotent grant are load-bearing for money-correctness. Rule: migrate **function-by-
  function behind a parity test** against the current impl (same DB effect / same Stripe request), flip only when green.
  **Never at the tail of other work.**
- **What STAYS app (per C046/C048), not a gap:** the webhook DISPATCH (composes `@suluk/stripe` webhookRouter +
  `@suluk/credits.grantOnce` + the app's crediting policy), the **pricing matrix** (COGS/markup/tiers), the **subscription-
  pooling + refund workflow**, alerts/email, and the Stripe-PLATFORM ops with no agnostic equivalent (hosted Checkout,
  saved-card management, subscription CRUD, Tax).
- **`@suluk/stripe` in toolfactory** is now the deprecated shell (its 4 imports — `verifyStripeSignature`/`webhookRouter`/
  `STRIPE_EVENTS`/`toForm` — still resolve). Bump it to `^0.2.0` during Phase C and drop the shell when the webhook moves
  to `@suluk/payments`.
- **Sequencing:** A → B → C. A and B are independently shippable; C is gated on its own parity harness. Recommend an ADR
  per phase at build time (C050+), each with its parity plan.
