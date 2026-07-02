[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / schemaDDL

# Function: schemaDDL()

> **schemaDDL**(`tables`, `opts?`): `string`

Defined in: [ddl.ts:48](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/drizzle/src/ddl.ts#L48)

`CREATE TABLE` DDL for many tables, newline-joined — the dev-schema twin of the prod migrations.

## Parameters

### tables

(`Table`\<`TableConfig`\<`Column`\<`any`, `object`, `object`\>\>\> \| [`TableMeta`](../interfaces/TableMeta.md))[]

### opts?

[`DdlOptions`](../interfaces/DdlOptions.md) = `{}`

## Returns

`string`
