[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / softDeleteValues

# Function: softDeleteValues()

> **softDeleteValues**(`opts?`, `now?`): `Record`\<`string`, `string`\>

Defined in: [mutations.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/drizzle/src/mutations.ts#L20)

The patch a soft delete applies — sets the deletedAt column to `now` (default current time).

## Parameters

### opts?

[`SoftDeleteOptions`](../interfaces/SoftDeleteOptions.md) = `{}`

### now?

`Date` = `...`

## Returns

`Record`\<`string`, `string`\>
