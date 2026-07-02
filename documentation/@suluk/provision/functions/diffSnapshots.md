[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / diffSnapshots

# Function: diffSnapshots()

> **diffSnapshots**(`prev`, `next`): [`MigrationStep`](../interfaces/MigrationStep.md)[]

Defined in: [provision/src/migration.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/provision/src/migration.ts#L34)

Diff the previous snapshot against the next (current) config → the ordered migration steps. Creates + updates come in
 binding-DAG order (producers first); deprovisions of dropped instances come last, in reverse (consumers first).

## Parameters

### prev

[`Snapshot`](../interfaces/Snapshot.md)

### next

[`ProvisionConfig`](../interfaces/ProvisionConfig.md)

## Returns

[`MigrationStep`](../interfaces/MigrationStep.md)[]
