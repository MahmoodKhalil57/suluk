# Types & Enums

## types

### `OperationState`
OSB last-operation state for an ASYNC provision/deprovision (a database that takes seconds, a cert that takes minutes).
```ts
"in progress" | "succeeded" | "failed"
```

### `ServicePlan`
A plan tier within an offering (OSB Service Plan). Most infra has a single "standard" plan; `free` marks $0 tiers.
**Properties:**
- `id: string`
- `name: string`
- `description: string` (optional)
- `free: boolean` (optional)

### `ServiceOffering`
What a broker can provision (OSB Service Offering). `bindable` = provisioning yields credentials/config to bind.
**Properties:**
- `id: string` — the stable broker id used in a config's `service`, e.g. "cloudflare-d1".
- `name: string`
- `description: string`
- `bindable: boolean`
- `plans: ServicePlan[]`

### `Catalog`
The set of offerings a broker advertises (OSB Catalog).
**Properties:**
- `services: ServiceOffering[]`

### `InstanceSpec`
A declared instance the platform WANTS (the desired state — one entry in provision.config).
**Properties:**
- `ref: string` — a unique handle within the config, referenced by other instances' params (e.g. "db", "kv-sessions").
- `service: string` — the broker id that provisions it (must match a catalog offering's id), e.g. "cloudflare-d1".
- `plan: string` (optional) — the plan id; defaults to the offering's first plan.
- `name: string` — the provider-facing name, e.g. "toolfactory-db".
- `params: Record<string, unknown>` (optional) — provision params (broker-specific). A string value of the form `@<ref>.<key>` is a BINDING REFERENCE, resolved at
 apply time from that producer instance's outputs — this is what wires the provisioning DAG.
- `bind: Record<string, string>` (optional) — binding outputs → env var names: where this instance's credentials/ids LAND (the binding-chain sink). e.g.
 `{ database_id: "CLOUDFLARE_D1_ID" }`.
- `protected: boolean` (optional) — guard a stateful resource (a database, a bucket) from destruction: `prune` + `teardown` SKIP it unless forced.
 The terraform `prevent_destroy` analog — the safety rail for the resources whose loss is unrecoverable.

### `InstanceState`
The live record of a provisioned instance (the journal `plan` diffs against — like drizzle's migration meta).
**Properties:**
- `ref: string`
- `service: string`
- `plan: string` (optional)
- `name: string`
- `instanceId: string` — the provider's instance id (e.g. the D1 uuid, the KV namespace id).
- `outputs: Record<string, string>` — the binding outputs captured at provision/bind time (so downstream refs resolve without re-calling the provider).
- `fingerprint: string` — a stable fingerprint of (name + plan + params), to detect drift → an `update` step.
- `protected: boolean` (optional) — carried from the spec so `teardown`/`prune` (which work off the journal) honour the destroy guard.
- `provisionedAt: number`

### `ProvisionRequest`
The resolved request handed to a broker's `provision` (param refs already substituted).
**Properties:**
- `ref: string`
- `name: string`
- `plan: string` (optional)
- `params: Record<string, unknown>`

### `ProvisionResult`
A broker's provision outcome — sync (ready now) or async (poll `lastOperation` with `operation`). An async ack MAY
 already carry `outputs` (e.g. a D1 create returns the database_id immediately even though the DB takes a moment to be
 queryable); they're threaded once the op settles, alongside any from `bind`.
```ts
{ state: "succeeded"; instanceId: string; outputs?: Record<string, string> } | { state: "in progress"; operation: string; instanceId?: string; outputs?: Record<string, string> }
```

### `BindRequest`
The resolved request handed to a broker's `bind`.
**Properties:**
- `ref: string`
- `name: string`
- `instanceId: string`
- `params: Record<string, unknown>`

### `BindResult`
A broker's bind outcome — the credentials/config the platform + downstream instances consume.
**Properties:**
- `outputs: Record<string, string>`

### `OperationRequest`
The request handed to `lastOperation` / `deprovision`.
**Properties:**
- `ref: string`
- `name: string`
- `instanceId: string` (optional)
- `operation: string`

### `Broker`
The OSB-shaped broker every service implements. Provision MUST be idempotent (re-running reconciles, never duplicates —
OSB's "200 vs 201" rule). `lastOperation`/`bind`/`deprovision` are optional: a synchronous, non-bindable, or
never-torn-down service simply omits them.

### `BindingSink`
Where bound credentials LAND. The default sink writes the @suluk/env manifest (typed + post-quantum-encrypted +
 commit-safe); a test passes an in-memory sink. `mapping` is the instance's `bind` (output key → env var name).

### `StateStore`
The persisted provision journal (desired-vs-live diffing). The default store is a JSON file; a test passes memory.

## plan

### `ProvisionPlan`
**Properties:**
- `steps: PlanStep[]`
- `orphans: string[]` — refs present in state but absent from config — deprovisioned only when pruning is on (else surfaced, not touched).
- `clean: boolean` — true when every step is a noop and there are no (prunable) orphans — the `check` CI gate passes on this.

### `PlanStep`
**Properties:**
- `ref: string`
- `service: string`
- `name: string`
- `action: StepAction`
- `reason: string` — human-readable cause: "new" | "params changed" | "up to date" | "orphan (in state, not in config)".

### `StepAction`
```ts
"create" | "update" | "noop" | "deprovision"
```

## apply

### `ApplyResult`
**Properties:**
- `steps: AppliedStep[]`
- `state: InstanceState[]`
- `outputsByRef: Record<string, Record<string, string>>` — every instance's resolved outputs after the run (for assertions + downstream tooling).

### `AppliedStep`
**Properties:**
- `ref: string`
- `action: StepAction`
- `instanceId: string` (optional)
- `outputs: Record<string, string>` (optional)

## check

### `DriftReport`
**Properties:**
- `clean: boolean`
- `drift: PlanStep[]` — the steps that would change something (create/update/deprovision) — empty when in sync.
- `orphans: string[]`

## pull

### `PullReport`
**Properties:**
- `entries: PullEntry[]`
- `missing: string[]` — journaled refs whose live resource is GONE (deleted outside the config) — the next `apply` re-creates them.
- `drifted: string[]` — journaled refs whose live outputs differ from the journal.
- `clean: boolean` — nothing missing or drifted (unknowns don't count — we couldn't verify them).

### `PullEntry`
**Properties:**
- `ref: string`
- `service: string`
- `name: string`
- `instanceId: string`
- `status: PullStatus` — live = present + matches · missing = gone from the provider · drifted = present but outputs changed · unknown = the
 broker has no `fetch`, so we couldn't check.
- `liveOutputs: Record<string, string>` (optional)

### `PullStatus`
```ts
"live" | "missing" | "drifted" | "unknown"
```

### `DiscoveredInstance`
**Properties:**
- `service: string`
- `name: string`
- `instanceId: string`
- `outputs: Record<string, string>` (optional)

## teardown

### `TeardownResult`
**Properties:**
- `torn: string[]` — refs deprovisioned (or, under dryRun, that WOULD be).
- `kept: { ref: string; reason: string }[]` — refs kept + why: protected (no force) or the broker can't deprovision.
- `state: InstanceState[]` — the remaining journal after teardown (the kept instances).

## snapshot

### `Snapshot`
**Properties:**
- `version: string`
- `idx: number` — the migration index this snapshot represents (−1 = the empty pre-history state).
- `instances: InstanceSpec[]`

## migration

### `Migration`
**Properties:**
- `idx: number`
- `tag: string` — the file stem, e.g. "0000_initial".
- `steps: MigrationStep[]`

### `MigrationStep`
**Properties:**
- `action: "create" | "update" | "deprovision"`
- `ref: string`
- `service: string`
- `name: string`
- `spec: InstanceSpec` (optional) — the full spec for a create/update (so the migration is self-describing); absent for a deprovision.

## migration-store

### `MigrationStore`

### `MigrationJournal`
**Properties:**
- `version: string`
- `entries: { idx: number; tag: string }[]`

## migrate

### `MigrateResult`
**Properties:**
- `applied: number[]`
- `upToDate: boolean`

## app

### `ProvisionApp`
**Properties:**
- `config: ProvisionConfig` — the desired instances (+ pruneOrphans default).
- `brokers: Record<string, Broker>` — service id → broker (the executors `apply` dispatches to).
- `store: StateStore` — the journal (defaults to a file store in a real config).
- `sink: BindingSink` (optional) — where bound credentials land (defaults to the @suluk/env sink). Optional.
- `migrations: MigrationStore` (optional) — the committed migration history — enables `generate` + `migrate` (the drizzle-style repeatable path). Optional;
 a real config points it at `fileMigrationStore("provision")`.

## cli

### `CliResult`
**Properties:**
- `output: string`
- `exitCode: number`
