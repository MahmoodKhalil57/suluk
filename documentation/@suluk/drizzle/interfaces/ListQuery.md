[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / ListQuery

# Interface: ListQuery

Defined in: [query.ts:39](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/drizzle/src/query.ts#L39)

## Properties

### filters

> **filters**: `Record`\<`string`, `string`\>

Defined in: [query.ts:48](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/drizzle/src/query.ts#L48)

column → equality value.

***

### limit

> **limit**: `number`

Defined in: [query.ts:41](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/drizzle/src/query.ts#L41)

rows to return (= perPage).

***

### offset

> **offset**: `number`

Defined in: [query.ts:43](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/drizzle/src/query.ts#L43)

rows to skip (= (page-1)*perPage).

***

### orderBy?

> `optional` **orderBy?**: `object`

Defined in: [query.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/drizzle/src/query.ts#L44)

#### column

> **column**: `string`

#### dir

> **dir**: `"asc"` \| `"desc"`

***

### page

> **page**: `number`

Defined in: [query.ts:49](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/drizzle/src/query.ts#L49)

***

### perPage

> **perPage**: `number`

Defined in: [query.ts:50](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/drizzle/src/query.ts#L50)

***

### q?

> `optional` **q?**: `string`

Defined in: [query.ts:46](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/drizzle/src/query.ts#L46)

free-text search term.
