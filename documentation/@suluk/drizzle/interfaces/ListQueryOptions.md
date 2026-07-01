[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / ListQueryOptions

# Interface: ListQueryOptions

Defined in: [query.ts:10](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/drizzle/src/query.ts#L10)

## Properties

### columns?

> `optional` **columns?**: `string`[]

Defined in: [query.ts:12](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/drizzle/src/query.ts#L12)

sortable + filterable columns (default: all of the table's columns).

***

### defaultPerPage?

> `optional` **defaultPerPage?**: `number`

Defined in: [query.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/drizzle/src/query.ts#L14)

default page size (default 20).

***

### maxPerPage?

> `optional` **maxPerPage?**: `number`

Defined in: [query.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/drizzle/src/query.ts#L16)

max page size — `perPage` is clamped to it (default 100).
