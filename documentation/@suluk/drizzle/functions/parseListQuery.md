[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / parseListQuery

# Function: parseListQuery()

> **parseListQuery**(`raw`, `table`, `opts?`): [`ListQuery`](../interfaces/ListQuery.md)

Defined in: [query.ts:65](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/drizzle/src/query.ts#L65)

Normalize a raw query object into a [ListQuery](../interfaces/ListQuery.md) — pure, validating against the table's real columns:
page/perPage are clamped (≥1, ≤maxPerPage); `sort` is honored only for a real column; any other key matching a
column becomes an equality filter (unknown keys are ignored — no injection of arbitrary columns).

## Parameters

### raw

`RawQuery`

### table

`Table`

### opts?

[`ListQueryOptions`](../interfaces/ListQueryOptions.md) = `{}`

## Returns

[`ListQuery`](../interfaces/ListQuery.md)
