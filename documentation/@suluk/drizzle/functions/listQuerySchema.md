[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / listQuerySchema

# Function: listQuerySchema()

> **listQuerySchema**(`table?`, `opts?`): `ZodType`

Defined in: [query.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/drizzle/src/query.ts#L27)

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
