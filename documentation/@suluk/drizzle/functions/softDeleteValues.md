[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / softDeleteValues

# Function: softDeleteValues()

> **softDeleteValues**(`opts?`, `now?`): `Record`\<`string`, `string`\>

Defined in: [mutations.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/drizzle/src/mutations.ts#L20)

The patch a soft delete applies — sets the deletedAt column to `now` (default current time).

## Parameters

### opts?

[`SoftDeleteOptions`](../interfaces/SoftDeleteOptions.md) = `{}`

### now?

`Date` = `...`

## Returns

`Record`\<`string`, `string`\>
