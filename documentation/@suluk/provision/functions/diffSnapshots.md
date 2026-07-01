[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / diffSnapshots

# Function: diffSnapshots()

> **diffSnapshots**(`prev`, `next`): [`MigrationStep`](../interfaces/MigrationStep.md)[]

Defined in: [provision/src/migration.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/provision/src/migration.ts#L34)

Diff the previous snapshot against the next (current) config → the ordered migration steps. Creates + updates come in
 binding-DAG order (producers first); deprovisions of dropped instances come last, in reverse (consumers first).

## Parameters

### prev

[`Snapshot`](../interfaces/Snapshot.md)

### next

[`ProvisionConfig`](../interfaces/ProvisionConfig.md)

## Returns

[`MigrationStep`](../interfaces/MigrationStep.md)[]
