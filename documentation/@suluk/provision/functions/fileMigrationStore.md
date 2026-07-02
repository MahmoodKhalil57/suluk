[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / fileMigrationStore

# Function: fileMigrationStore()

> **fileMigrationStore**(`dir?`): [`MigrationStore`](../interfaces/MigrationStore.md)

Defined in: [provision/src/migration-store.ts:61](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/provision/src/migration-store.ts#L61)

A file-backed migration store rooted at `dir` (default `provision/`). Commits `NNNN_tag.json` + `meta/_journal.json` +
 `meta/NNNN_snapshot.json`; keeps the env-local `meta/_applied.json` (gitignore it).

## Parameters

### dir?

`string` = `"provision"`

## Returns

[`MigrationStore`](../interfaces/MigrationStore.md)
