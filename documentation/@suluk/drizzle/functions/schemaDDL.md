[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / schemaDDL

# Function: schemaDDL()

> **schemaDDL**(`tables`, `opts?`): `string`

Defined in: [ddl.ts:48](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/drizzle/src/ddl.ts#L48)

`CREATE TABLE` DDL for many tables, newline-joined — the dev-schema twin of the prod migrations.

## Parameters

### tables

(`Table`\<`TableConfig`\<`Column`\<`any`, `object`, `object`\>\>\> \| [`TableMeta`](../interfaces/TableMeta.md))[]

### opts?

[`DdlOptions`](../interfaces/DdlOptions.md) = `{}`

## Returns

`string`
