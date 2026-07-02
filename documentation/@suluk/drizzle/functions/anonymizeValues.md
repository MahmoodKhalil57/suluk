[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / anonymizeValues

# Function: anonymizeValues()

> **anonymizeValues**(`columns`, `value?`): `Record`\<`string`, `string` \| `null`\>

Defined in: [mutations.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/drizzle/src/mutations.ts#L26)

The patch an anonymize-on-delete applies — redacts each named column to `value` (null by default). Pair with a
 soft-delete to keep the row (FK-safe right-to-be-forgotten).

## Parameters

### columns

`string`[]

### value?

`string` \| `null`

## Returns

`Record`\<`string`, `string` \| `null`\>
