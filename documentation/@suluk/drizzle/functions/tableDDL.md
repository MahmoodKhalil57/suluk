[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / tableDDL

# Function: tableDDL()

> **tableDDL**(`table`, `opts?`): `string`

Defined in: [ddl.ts:40](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/drizzle/src/ddl.ts#L40)

`CREATE TABLE` DDL for one drizzle table (or its already-read metadata). Single-column primary keys only — a
table-level composite `primaryKey({columns})` isn't visible on the column-descriptor floor (it needs
dialect-specific `getTableConfig`, deferred like FK/relation projection); such a table emits its columns without
the composite constraint, so declare those tables' DDL by hand for now.

## Parameters

### table

`Table`\<`TableConfig`\<`Column`\<`any`, `object`, `object`\>\>\> \| [`TableMeta`](../interfaces/TableMeta.md)

### opts?

[`DdlOptions`](../interfaces/DdlOptions.md) = `{}`

## Returns

`string`
