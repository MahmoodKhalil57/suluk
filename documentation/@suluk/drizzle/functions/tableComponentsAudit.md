[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / tableComponentsAudit

# Function: tableComponentsAudit()

> **tableComponentsAudit**(`tables`): `object`

Defined in: [schemas.ts:83](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/drizzle/src/schemas.ts#L83)

Like [tableComponents](tableComponents.md) but enumerates name collisions instead of dropping them silently.

## Parameters

### tables

readonly `Table`\<`TableConfig`\<`Column`\<`any`, `object`, `object`\>\>\>[]

## Returns

`object`

### collisions

> **collisions**: `string`[]

### schemas

> **schemas**: `Record`\<`string`, [`Schema`](../../core/type-aliases/Schema.md)\>
