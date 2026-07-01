[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / diffSnapshots

# Function: diffSnapshots()

> **diffSnapshots**(`prev`, `next`): [`MigrationStep`](../interfaces/MigrationStep.md)[]

Defined in: [provision/src/migration.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/migration.ts#L34)

Diff the previous snapshot against the next (current) config → the ordered migration steps. Creates + updates come in
 binding-DAG order (producers first); deprovisions of dropped instances come last, in reverse (consumers first).

## Parameters

### prev

[`Snapshot`](../interfaces/Snapshot.md)

### next

[`ProvisionConfig`](../interfaces/ProvisionConfig.md)

## Returns

[`MigrationStep`](../interfaces/MigrationStep.md)[]
