[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / listQuerySchema

# Function: listQuerySchema()

> **listQuerySchema**(`table?`, `opts?`): `ZodType`

Defined in: [query.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/drizzle/src/query.ts#L27)

The Zod query schema for a list route: page/perPage/sort/order/q (coerced from strings). Extra column filters
are read by [parseListQuery](parseListQuery.md) at runtime (OpenAPI query params are flat, so they aren't enumerated here).
`table` is OPTIONAL: with a table (or `opts.columns`) `sort` is a column enum; without either it is a free string —
so the contract-projection layer (@suluk/builder), which holds a Zod entity rather than a Drizzle table, can call
`listQuerySchema()` and still emit the same five params into the v4 doc + SDK.

## Parameters

### table?

`Table`\<`TableConfig`\<`Column`\<`any`, `object`, `object`\>\>\>

### opts?

[`ListQueryOptions`](../interfaces/ListQueryOptions.md) = `{}`

## Returns

`ZodType`
