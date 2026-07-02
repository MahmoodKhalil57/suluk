[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / schemaDDL

# Function: schemaDDL()

> **schemaDDL**(`tables`, `opts?`): `string`

Defined in: [ddl.ts:48](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/drizzle/src/ddl.ts#L48)

`CREATE TABLE` DDL for many tables, newline-joined — the dev-schema twin of the prod migrations.

## Parameters

### tables

(`Table`\<`TableConfig`\<`Column`\<`any`, `object`, `object`\>\>\> \| [`TableMeta`](../interfaces/TableMeta.md))[]

### opts?

[`DdlOptions`](../interfaces/DdlOptions.md) = `{}`

## Returns

`string`
