[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / anonymizeValues

# Function: anonymizeValues()

> **anonymizeValues**(`columns`, `value?`): `Record`\<`string`, `string` \| `null`\>

Defined in: [mutations.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/drizzle/src/mutations.ts#L26)

The patch an anonymize-on-delete applies — redacts each named column to `value` (null by default). Pair with a
 soft-delete to keep the row (FK-safe right-to-be-forgotten).

## Parameters

### columns

`string`[]

### value?

`string` \| `null`

## Returns

`Record`\<`string`, `string` \| `null`\>
