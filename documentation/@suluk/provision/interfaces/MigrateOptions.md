[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / MigrateOptions

# Interface: MigrateOptions

Defined in: [provision/src/migrate.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/migrate.ts#L14)

## Properties

### brokers

> **brokers**: `Record`\<`string`, [`Broker`](Broker.md)\>

Defined in: [provision/src/migrate.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/migrate.ts#L15)

***

### log?

> `optional` **log?**: (`msg`) => `void`

Defined in: [provision/src/migrate.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/migrate.ts#L22)

#### Parameters

##### msg

`string`

#### Returns

`void`

***

### migrations

> **migrations**: [`MigrationStore`](MigrationStore.md)

Defined in: [provision/src/migrate.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/migrate.ts#L19)

the committed migrations + this env's applied-ledger.

***

### poll?

> `optional` **poll?**: [`PollOptions`](PollOptions.md)

Defined in: [provision/src/migrate.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/migrate.ts#L21)

***

### sink?

> `optional` **sink?**: [`BindingSink`](BindingSink.md)

Defined in: [provision/src/migrate.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/migrate.ts#L20)

***

### store

> **store**: [`StateStore`](StateStore.md)

Defined in: [provision/src/migrate.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/migrate.ts#L17)

the live journal (InstanceState).
