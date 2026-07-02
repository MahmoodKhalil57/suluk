[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / ProvisionApp

# Interface: ProvisionApp

Defined in: [provision/src/app.ts:11](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/provision/src/app.ts#L11)

## Properties

### brokers

> **brokers**: `Record`\<`string`, [`Broker`](Broker.md)\>

Defined in: [provision/src/app.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/provision/src/app.ts#L15)

service id → broker (the executors `apply` dispatches to).

***

### config

> **config**: [`ProvisionConfig`](ProvisionConfig.md)

Defined in: [provision/src/app.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/provision/src/app.ts#L13)

the desired instances (+ pruneOrphans default).

***

### migrations?

> `optional` **migrations?**: [`MigrationStore`](MigrationStore.md)

Defined in: [provision/src/app.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/provision/src/app.ts#L22)

the committed migration history — enables `generate` + `migrate` (the drizzle-style repeatable path). Optional;
 a real config points it at `fileMigrationStore("provision")`.

***

### sink?

> `optional` **sink?**: [`BindingSink`](BindingSink.md)

Defined in: [provision/src/app.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/provision/src/app.ts#L19)

where bound credentials land (defaults to the @suluk/env sink). Optional.

***

### store

> **store**: [`StateStore`](StateStore.md)

Defined in: [provision/src/app.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/provision/src/app.ts#L17)

the journal (defaults to a file store in a real config).
