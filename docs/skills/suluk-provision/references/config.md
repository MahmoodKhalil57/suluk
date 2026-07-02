# Configuration

## ProvisionConfig

### Properties

#### instances

the instances to provision (desired state). Order is free — the binding DAG decides apply order.

**Type:** `InstanceSpec[]`

**Required:** yes

#### pruneOrphans

orphan mitigation default: deprovision instances in state but not in config. DEFAULT false (destructive — opt in
 here or per-apply). `apply --prune` / `check` honour it.

**Type:** `boolean`

## ApplyOptions

### Properties

#### brokers

broker id → broker (the catalog of executors). A step whose `service` is absent here is an error.

**Type:** `Record<string, Broker>`

**Required:** yes

#### store

the journal load/save (a JSON file in prod; memory in tests).

**Type:** `StateStore`

**Required:** yes

#### sink

where bound credentials land (the @suluk/env manifest in prod; memory in tests). Optional — omit to skip sinking.

**Type:** `BindingSink`

#### prune

deprovision orphans (state − config). Defaults to the config's `pruneOrphans`.

**Type:** `boolean`

#### poll

async-poll tuning + seams (see PollOptions).

**Type:** `PollOptions`

#### log

**Type:** `(msg: string) => void`

## PollOptions

### Properties

#### intervalMs

**Type:** `number`

#### timeoutMs

**Type:** `number`

#### sleep

**Type:** `(ms: number) => Promise<void>`

#### now

**Type:** `() => number`

## TeardownOptions

### Properties

#### brokers

**Type:** `Record<string, Broker>`

**Required:** yes

#### store

**Type:** `StateStore`

**Required:** yes

#### force

override the `protected` rail — required to destroy a protected instance.

**Type:** `boolean`

#### dryRun

preview only: compute the order + honour the rails, but call NO provider + don't save. The confirmation default.

**Type:** `boolean`

#### log

**Type:** `(msg: string) => void`

#### poll

**Type:** `PollOptions`

## MigrateOptions

### Properties

#### brokers

**Type:** `Record<string, Broker>`

**Required:** yes

#### store

the live journal (InstanceState).

**Type:** `StateStore`

**Required:** yes

#### migrations

the committed migrations + this env's applied-ledger.

**Type:** `MigrationStore`

**Required:** yes

#### sink

**Type:** `BindingSink`

#### poll

**Type:** `PollOptions`

#### log

**Type:** `(msg: string) => void`

## EnvSinkOptions

### Properties

#### plain

predicate: which env vars are written PLAINTEXT (non-secret). Default: none — every binding is encrypted.

**Type:** `(envVar: string) => boolean`

#### envPath

**Type:** `string`

#### keysPath

**Type:** `string`