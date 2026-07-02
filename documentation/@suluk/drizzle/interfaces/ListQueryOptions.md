[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / ListQueryOptions

# Interface: ListQueryOptions

Defined in: [query.ts:10](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/drizzle/src/query.ts#L10)

## Properties

### columns?

> `optional` **columns?**: `string`[]

Defined in: [query.ts:12](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/drizzle/src/query.ts#L12)

sortable + filterable columns (default: all of the table's columns).

***

### defaultPerPage?

> `optional` **defaultPerPage?**: `number`

Defined in: [query.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/drizzle/src/query.ts#L14)

default page size (default 20).

***

### maxPerPage?

> `optional` **maxPerPage?**: `number`

Defined in: [query.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/drizzle/src/query.ts#L16)

max page size — `perPage` is clamped to it (default 100).
