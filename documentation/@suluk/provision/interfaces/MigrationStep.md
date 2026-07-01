[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / MigrationStep

# Interface: MigrationStep

Defined in: [provision/src/migration.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/migration.ts#L13)

## Properties

### action

> **action**: `"create"` \| `"update"` \| `"deprovision"`

Defined in: [provision/src/migration.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/migration.ts#L14)

***

### name

> **name**: `string`

Defined in: [provision/src/migration.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/migration.ts#L17)

***

### ref

> **ref**: `string`

Defined in: [provision/src/migration.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/migration.ts#L15)

***

### service

> **service**: `string`

Defined in: [provision/src/migration.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/migration.ts#L16)

***

### spec?

> `optional` **spec?**: [`InstanceSpec`](InstanceSpec.md)

Defined in: [provision/src/migration.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/migration.ts#L19)

the full spec for a create/update (so the migration is self-describing); absent for a deprovision.
