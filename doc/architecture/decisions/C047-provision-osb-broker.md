# C47. `@suluk/provision` — declarative provisioning on the Open Service Broker API, driven like drizzle-kit

> **Provenance:** Candidate-fork ADR (Suluk), not a SIG decision. Operator-surfaced: *"toolfactory has a lot of LOC in
> scripts for setting up and provisioning the different services, when we could easily hook this up together with
> @suluk/env / @suluk/cloudflare / @suluk/deploy + a new @suluk/provision package… we should use the Open Service Broker
> API"* and *"we should also be heavily inspired by the drizzle-kit migrations CLI."* The OSB v2 master spec sits in the
> package as [`spec.md`](../../../tooling/ts/packages/provision/spec.md), the contract the types mirror.

Date: 2026-07-01

## Status

Accepted; **core BUILT + witnessed** (build #1). Decision ceiling **0.5** (design) / **0.55** (the core framework, unit-
witnessed). Ledger: [`0provision.bn`](../../../plan/facts/0provision.bn) (burhan True, converge clean 325). **Not a
contract-facet change** — an app-provisioning library; it never touches `buildAda`/`matchRequest`, so there is no D1
concern. A layer **above** `@suluk/cloudflare` / `@suluk/deploy` / `@suluk/env`, which it composes.

## Context

toolfactory hand-rolls ~700 LOC of provisioning across `scripts/`: `provision.ts` (D1 create + migrate + Pages),
`provision-domains.ts` (229 LOC, async certs/DNS), `provision-stripe.ts`, `provision-kv.ts`, `mint-*.ts` (scoped tokens),
`sync-secrets.ts`. Each is a bespoke "create the resource → capture its id/credential → feed it to the next step / push it
as a secret" sequence. `@suluk/cloudflare` already exposes the API-driven idempotent provisioners (`provisionD1`,
`provisionKvNamespace`, `provisionR2Bucket`, `putSecrets`); what's missing is the **orchestration + declarative CLI** on
top.

Two references compose onto this exactly:

- **Open Service Broker API** → the *lifecycle*: a **Catalog** of offerings+plans, then **provision** a Service Instance,
  **bind** to get credentials/config, **deprovision**, with **last-operation polling** for async resources and **orphan
  mitigation** for teardown.
- **drizzle-kit** → the *CLI ergonomics*: one declarative config, `plan`/diff (desired vs live), `apply`/push, `pull`
  (introspect), `check` (drift gate).

## Decision

A new package `@suluk/provision`, the OSB **client/orchestrator**. Each service is a `Broker`
(`catalog`/`provision`/`lastOperation?`/`bind?`/`deprovision?` — the optional verbs let a sync, non-bindable, or
never-torn-down service omit them). The platform declares the desired infra in a config; `plan` diffs it against a
journal of live state; `apply` walks the brokers.

**The load-bearing idea — the binding chain.** Provisioning is a **DAG**: a param string `@<ref>.<key>` names another
instance's binding **output**, which is both a DAG **edge** (this instance depends on that producer) and a **substitution**
(resolved from the producer's outputs at apply time). So `create D1 → bind database_id`, `mint a scoped token → bind
CLOUDFLARE_D1_TOKEN`, `create the Stripe webhook → bind STRIPE_WEBHOOK_SECRET` — each output feeds the next instance's
params **and** lands in the **`@suluk/env`** manifest (typed, post-quantum-encrypted, commit-safe). That is toolfactory's
hand-rolled sequence given a uniform shape.

| OSB API | drizzle-kit | `@suluk/provision` | replaces |
|---|---|---|---|
| Service Broker | dialect driver | a `Broker` adapter | — |
| Catalog (offerings+plans) | — | each broker advertises what it provisions | — |
| Provision (Service Instance) | a table | a declared instance (`{ ref, service, name, params, bind }`) | `provision.ts` |
| **Binding** | — | output → `@suluk/env` + downstream `@ref.key` params | `mint-*`, the id patches |
| Last-operation (async) | — | poll-until-ready | `provision-domains.ts` |
| Deprovision / orphan mitigation | drop on removal | guarded prune | — |
| `generate` (diff) | `plan` (pure: config × state → steps) | — |
| `push` | `apply` (provision → poll → bind → sink → save) | `provision.ts` + `sync-secrets.ts` |
| `pull` (introspect) | `pull` (live infra → config) | — |
| `check` | `assertNoDrift` (CI gate; → cockpit) | `checklist-gate.ts` |

**Brokers** (grounded in the scripts): `cloudflare-d1` · `cloudflare-kv` · `cloudflare-r2` · `cloudflare-secrets` (wrap
`@suluk/cloudflare`), `stripe` (`@suluk/stripe`/`@suluk/billing`), `domains` (the async one), `tokens` (scoped CF tokens).

## Build log

- **#1 — the CORE framework** (`2026-07-01`, **provision 10 pass**, tsc clean). Broker-agnostic, the design-risk layer
  first: the OSB `Broker` interface + `InstanceSpec`/`InstanceState`/`ProvisionResult` + the `BindingSink`/`StateStore`
  seams; `defineProvision` (static validation — unique refs, acyclic DAG); `refs` (parse/resolve `@ref.key`, fail-closed
  on a missing output, the drift fingerprint); `dag.topoOrder` (Kahn — producers before consumers); `plan` (the pure
  diff → create/update/noop/deprovision); `apply` (the executor — resolve the binding chain, idempotent provision, poll
  `lastOperation` until an async create settles with the **clock + sleep injected**, bind, sink, prune orphans last, save
  the journal); `check.assertNoDrift` (the CI gate); `memory` (in-memory store+sink). Witnessed through the **full
  lifecycle** with mock brokers — DAG order, async polling, the binding chain (a downstream `@ref.key` resolving to a
  freshly-provisioned `database_id`), idempotent re-apply (all-noops, zero provider calls), drift re-provisioning only the
  drifted instance, and the orphan prune (which never fires without `--prune`). A real bug the witness caught + fixed: an
  async ack that also yields outputs (a D1 uuid is known at submit time) must thread them past the poll.

## Consequences / honesty

- **The core is built; the value lands with the brokers + CLI.** `apply` over mock brokers proves the lifecycle; the
  payoff is the concrete `cloudflare-*`/`stripe`/`domains`/`tokens` brokers wrapping the real providers, the `@suluk/env`
  sink, the file-backed store, and the `plan`/`apply`/`pull`/`studio`/`check` CLI — the next builds.
- **Provision must be idempotent — re-running reconciles.** The framework backstops it (a `noop` step skips the provider
  call entirely); each broker still implements OSB's "200 vs 201" idempotency for safety.
- **Deprovision is destructive and OFF by default.** Orphan mitigation fires only under an explicit `prune`/`--prune`.
- **The toolfactory cutover is a separate, careful step** (like the C046 live-billing rewiring) — only after each broker
  is byte-faithful to the script it replaces and witnessed.
