[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / MigrationStore

# Interface: MigrationStore

Defined in: [provision/src/migration-store.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/provision/src/migration-store.ts#L17)

## Methods

### applied()

> **applied**(): `Promise`\<`number`[]\>

Defined in: [provision/src/migration-store.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/provision/src/migration-store.ts#L26)

which migration indices THIS environment has applied.

#### Returns

`Promise`\<`number`[]\>

***

### lastSnapshot()

> **lastSnapshot**(): `Promise`\<[`Snapshot`](Snapshot.md)\>

Defined in: [provision/src/migration-store.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/provision/src/migration-store.ts#L19)

the latest committed snapshot, or EMPTY when there are no migrations yet.

#### Returns

`Promise`\<[`Snapshot`](Snapshot.md)\>

***

### listMigrations()

> **listMigrations**(): `Promise`\<[`Migration`](Migration.md)[]\>

Defined in: [provision/src/migration-store.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/provision/src/migration-store.ts#L22)

all migrations, in index order.

#### Returns

`Promise`\<[`Migration`](Migration.md)[]\>

***

### loadSnapshot()

> **loadSnapshot**(`idx`): `Promise`\<[`Snapshot`](Snapshot.md) \| `null`\>

Defined in: [provision/src/migration-store.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/provision/src/migration-store.ts#L20)

#### Parameters

##### idx

`number`

#### Returns

`Promise`\<[`Snapshot`](Snapshot.md) \| `null`\>

***

### markApplied()

> **markApplied**(`idx`): `Promise`\<`void`\>

Defined in: [provision/src/migration-store.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/provision/src/migration-store.ts#L27)

#### Parameters

##### idx

`number`

#### Returns

`Promise`\<`void`\>

***

### write()

> **write**(`migration`, `snapshot`): `Promise`\<`void`\>

Defined in: [provision/src/migration-store.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/provision/src/migration-store.ts#L24)

write a new migration + its snapshot, appending the journal.

#### Parameters

##### migration

[`Migration`](Migration.md)

##### snapshot

[`Snapshot`](Snapshot.md)

#### Returns

`Promise`\<`void`\>
