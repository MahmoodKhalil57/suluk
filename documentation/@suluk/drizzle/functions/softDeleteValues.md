[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / softDeleteValues

# Function: softDeleteValues()

> **softDeleteValues**(`opts?`, `now?`): `Record`\<`string`, `string`\>

Defined in: [mutations.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/drizzle/src/mutations.ts#L20)

The patch a soft delete applies — sets the deletedAt column to `now` (default current time).

## Parameters

### opts?

[`SoftDeleteOptions`](../interfaces/SoftDeleteOptions.md) = `{}`

### now?

`Date` = `...`

## Returns

`Record`\<`string`, `string`\>
