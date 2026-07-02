[**Suluk**](../../README.md)

***

[Suluk](../../packages.md) / @suluk/provision

<p align="center">
  <a href="https://github.com/MahmoodKhalil57/suluk">
    <img src="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/wordmark.png" alt="Suluk" width="360" />
  </a>
</p>

<h1 align="center">@suluk/provision</h1>

<p align="center"><b>Declarative service provisioning, driven like drizzle-kit — declare the infra you want in one config, then <code>plan</code> the diff and <code>apply</code> it along the binding DAG, landing credentials in <code>@suluk/env</code>.</b></p>

<p align="center">
  <em>Part of <a href="https://github.com/MahmoodKhalil57/suluk">Suluk</a> — one typed OpenAPI v4 contract projecting into every full-stack layer.</em>
</p>

---

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```sh
bun add @suluk/provision
```

## What it does

Infrastructure as a declarative config, modelled on the [Open Service Broker API](https://www.openservicebrokerapi.org/)
and driven like `drizzle-kit` (C047). You list the instances you want — each an OSB **broker** plus a
name, plan, params, and binding map — and the lifecycle is a pure function of that config × live state:

- **`plan`** diffs desired-vs-live into a reviewable list of steps (`create` / `update` / `noop` /
  `deprovision`), in **binding-DAG order**. Pure: no provider calls, no clock.
- **`apply`** walks that DAG and calls the OSB verbs — `provision` (idempotent) → poll async
  `lastOperation` until a create settles → `bind` for credentials → land them in a `BindingSink`
  (the `@suluk/env` manifest in prod). A downstream `@ref.key` param resolves to a freshly
  provisioned value, so the DAG wires itself.
- **`checkDrift` / `assertNoDrift`** is the CI gate (a clean plan ⇒ no drift).

A param of the form `@<ref>.<key>` is a **binding reference** — that's what makes `db` provision
before the `token` that scopes to `@db.database_id`. `defineProvision` validates the static shape
(unique refs, an acyclic binding DAG) at authoring time, so a loop or an unreferenceable ref is
caught before any provider is called. Stateful resources can be `protected` (the terraform
`prevent_destroy` analog). A drizzle-style **snapshot + migration** model gives repeatable,
documentable steps.

## Usage

```ts
import {
  defineProvision, plan, apply, assertNoDrift,
  memoryStore, memorySink,
  cloudflareD1, cloudflareToken,
} from "@suluk/provision";

// Declare the infra. `@db.database_id` wires the token AFTER the D1 database.
const config = defineProvision({
  instances: [
    { ref: "db", service: "cloudflare-d1", name: "app-db", protected: true, bind: { database_id: "CLOUDFLARE_D1_ID" } },
    { ref: "token", service: "cloudflare-token", name: "d1-token",
      params: { scope: "@db.database_id" }, bind: { token: "CLOUDFLARE_D1_TOKEN" } },
  ],
});

// The concrete Cloudflare brokers wrap @suluk/cloudflare's idempotent provisioners.
const brokers = { "cloudflare-d1": cloudflareD1(cf), "cloudflare-token": cloudflareToken(cf) };
const store = memoryStore();  // a JSON file in prod (`fileStore`)
const sink = memorySink();    // the @suluk/env manifest in prod (`envSink`)

// Review, then execute along the binding DAG.
const state = await store.load();
console.table(plan(config, state).steps); // [{ ref, action, reason }, …]

const result = await apply(config, { brokers, store, sink });
result.outputsByRef.db; // { database_id: "…" } — resolved outputs after the run

// CI gate: throw if the live infra has drifted from the config.
await assertNoDrift(config, await store.load());
```

## CLI

```sh
suluk-provision plan     # diff desired-vs-live
suluk-provision apply    # provision → bind → land credentials
suluk-provision check    # drift / orphan gate (CI)
suluk-provision status
```

## What's inside

| Export | What it does |
| --- | --- |
| `defineProvision(config)` | Validate + return the config (throws on dup/unknown ref or a cycle). |
| `plan(config, state, prune?)` | The pure diff → `ProvisionPlan` (`steps`, `orphans`, `clean`). |
| `apply(config, opts)` | Execute a plan along the binding DAG → `ApplyResult` (with resolved outputs). |
| `checkDrift` / `assertNoDrift` | Drift report + the CI gate. |
| `pull` / `reconcile` / `discover` | Read live state back; adopt un-tracked instances. |
| `teardown` | Deprovision (skips `protected` unless forced). |
| `topoOrder`, `parseRef`, `depsOf`, `resolveParams`, `fingerprint` | The binding-DAG + ref-resolution internals. |
| `snapshot` / `diffSnapshots` / `migrate` / `generate` | The drizzle-style snapshot + migration model. |
| `memoryStore` / `fileStore`, `memorySink` / `envSink` | The state store + binding sink (dev/test vs prod). |
| `cloudflareD1` / `cloudflareKv` / `cloudflareR2` / `cloudflareSecrets` / `cloudflareToken` / `cloudflarePagesDomain` | The concrete Cloudflare brokers. |
| `defineProvisionApp`, `runCli` | The drizzle-kit-style app config + CLI. |

Types `Broker`, `BindingSink`, `StateStore`, `Catalog`, `InstanceSpec`, `InstanceState`, and the OSB
request/result shapes are exported alongside.

## Boundary

`@suluk/provision` is the OSB **client / orchestrator** — a layer **above**
[`@suluk/cloudflare`](../cloudflare/README.md) (the idempotent provisioners it wraps as brokers),
[`@suluk/deploy`](../deploy/README.md), and [`@suluk/env`](../env/README.md) (the binding sink). It **orchestrates**;
they execute. Provider calls live in the brokers; the core is pure orchestration over them, with the
clock and sleep injected so `apply` is deterministically testable. It's the lower half of
[`@suluk/platform`](../platform/README.md), which merges each module's provision fragment into one config.

## License

Apache-2.0

## Interfaces

- [AppliedStep](interfaces/AppliedStep.md)
- [ApplyOptions](interfaces/ApplyOptions.md)
- [ApplyResult](interfaces/ApplyResult.md)
- [BindingSink](interfaces/BindingSink.md)
- [BindRequest](interfaces/BindRequest.md)
- [BindResult](interfaces/BindResult.md)
- [Broker](interfaces/Broker.md)
- [Catalog](interfaces/Catalog.md)
- [CliResult](interfaces/CliResult.md)
- [DiscoveredInstance](interfaces/DiscoveredInstance.md)
- [DriftReport](interfaces/DriftReport.md)
- [EnvSinkOptions](interfaces/EnvSinkOptions.md)
- [InstanceSpec](interfaces/InstanceSpec.md)
- [InstanceState](interfaces/InstanceState.md)
- [MigrateOptions](interfaces/MigrateOptions.md)
- [MigrateResult](interfaces/MigrateResult.md)
- [Migration](interfaces/Migration.md)
- [MigrationJournal](interfaces/MigrationJournal.md)
- [MigrationStep](interfaces/MigrationStep.md)
- [MigrationStore](interfaces/MigrationStore.md)
- [OperationRequest](interfaces/OperationRequest.md)
- [PlanStep](interfaces/PlanStep.md)
- [PollOptions](interfaces/PollOptions.md)
- [ProvisionApp](interfaces/ProvisionApp.md)
- [ProvisionConfig](interfaces/ProvisionConfig.md)
- [ProvisionPlan](interfaces/ProvisionPlan.md)
- [ProvisionRequest](interfaces/ProvisionRequest.md)
- [PullEntry](interfaces/PullEntry.md)
- [PullReport](interfaces/PullReport.md)
- [ServiceOffering](interfaces/ServiceOffering.md)
- [ServicePlan](interfaces/ServicePlan.md)
- [Snapshot](interfaces/Snapshot.md)
- [StateStore](interfaces/StateStore.md)
- [TeardownOptions](interfaces/TeardownOptions.md)
- [TeardownResult](interfaces/TeardownResult.md)

## Type Aliases

- [OperationState](type-aliases/OperationState.md)
- [ProvisionResult](type-aliases/ProvisionResult.md)
- [PullStatus](type-aliases/PullStatus.md)
- [StepAction](type-aliases/StepAction.md)

## Variables

- [EMPTY\_SNAPSHOT](variables/EMPTY_SNAPSHOT.md)
- [SNAPSHOT\_VERSION](variables/SNAPSHOT_VERSION.md)

## Functions

- [apply](functions/apply.md)
- [assertNoDrift](functions/assertNoDrift.md)
- [checkDrift](functions/checkDrift.md)
- [cloudflareD1](functions/cloudflareD1.md)
- [cloudflareKv](functions/cloudflareKv.md)
- [cloudflarePagesDomain](functions/cloudflarePagesDomain.md)
- [cloudflareR2](functions/cloudflareR2.md)
- [cloudflareSecrets](functions/cloudflareSecrets.md)
- [cloudflareToken](functions/cloudflareToken.md)
- [cloudflareWwwRedirect](functions/cloudflareWwwRedirect.md)
- [defineProvision](functions/defineProvision.md)
- [defineProvisionApp](functions/defineProvisionApp.md)
- [depsOf](functions/depsOf.md)
- [diffSnapshots](functions/diffSnapshots.md)
- [discover](functions/discover.md)
- [envSink](functions/envSink.md)
- [fileMigrationStore](functions/fileMigrationStore.md)
- [fileStore](functions/fileStore.md)
- [fingerprint](functions/fingerprint.md)
- [generate](functions/generate.md)
- [memoryMigrationStore](functions/memoryMigrationStore.md)
- [memorySink](functions/memorySink.md)
- [memoryStore](functions/memoryStore.md)
- [migrate](functions/migrate.md)
- [migrationTag](functions/migrationTag.md)
- [parseRef](functions/parseRef.md)
- [plan](functions/plan.md)
- [pollToDone](functions/pollToDone.md)
- [pull](functions/pull.md)
- [reconcile](functions/reconcile.md)
- [resolveParams](functions/resolveParams.md)
- [runCli](functions/runCli.md)
- [snapshot](functions/snapshot.md)
- [stableStringify](functions/stableStringify.md)
- [teardown](functions/teardown.md)
- [topoOrder](functions/topoOrder.md)
