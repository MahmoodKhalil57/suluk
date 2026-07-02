[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / tableComponentsAudit

# Function: tableComponentsAudit()

> **tableComponentsAudit**(`tables`): `object`

Defined in: [schemas.ts:83](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/drizzle/src/schemas.ts#L83)

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
