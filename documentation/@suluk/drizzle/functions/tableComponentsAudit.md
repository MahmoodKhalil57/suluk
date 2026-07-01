[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / tableComponentsAudit

# Function: tableComponentsAudit()

> **tableComponentsAudit**(`tables`): `object`

Defined in: [schemas.ts:83](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/drizzle/src/schemas.ts#L83)

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
