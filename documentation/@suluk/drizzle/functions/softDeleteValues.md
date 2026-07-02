[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / softDeleteValues

# Function: softDeleteValues()

> **softDeleteValues**(`opts?`, `now?`): `Record`\<`string`, `string`\>

Defined in: [mutations.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/drizzle/src/mutations.ts#L20)

The patch a soft delete applies — sets the deletedAt column to `now` (default current time).

## Parameters

### opts?

[`SoftDeleteOptions`](../interfaces/SoftDeleteOptions.md) = `{}`

### now?

`Date` = `...`

## Returns

`Record`\<`string`, `string`\>
