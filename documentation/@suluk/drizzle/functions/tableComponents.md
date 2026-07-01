[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / tableComponents

# Function: tableComponents()

> **tableComponents**(`tables`): `Record`\<`string`, [`Schema`](../../core/type-aliases/Schema.md)\>

Defined in: [schemas.ts:78](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/drizzle/src/schemas.ts#L78)

Build a v4 components.schemas record from a set of tables: { [PascalName]: select-v4-schema }.
Keyed by the table's PascalCase name (C009 by-name). Collisions (two tables mapping to the same Pascal
name) are NOT silently merged — the last writer wins AND a warning is surfaced via [tableComponentsAudit](tableComponentsAudit.md).

## Parameters

### tables

readonly `Table`\<`TableConfig`\<`Column`\<`any`, `object`, `object`\>\>\>[]

## Returns

`Record`\<`string`, [`Schema`](../../core/type-aliases/Schema.md)\>
