[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / CrudOptions

# Interface: CrudOptions

Defined in: [crud.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/drizzle/src/crud.ts#L14)

## Properties

### anonymizeDelete?

> `optional` **anonymizeDelete?**: `object`

Defined in: [crud.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/drizzle/src/crud.ts#L30)

ANONYMIZE on delete (GDPR keep-record): DELETE redacts these columns instead of removing the row. Like
softDelete, the projected DELETE returns the affected row (200). The patch comes from `anonymizeValues`.

#### columns

> **columns**: `string`[]

***

### basePath?

> `optional` **basePath?**: `string`

Defined in: [crud.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/drizzle/src/crud.ts#L16)

Base path for the collection. Default "/" + tableName, e.g. "/users".

***

### idParam?

> `optional` **idParam?**: `string`

Defined in: [crud.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/drizzle/src/crud.ts#L18)

Path-param name for the item id. Default "id" ⇒ ".../:id".

***

### listQuery?

> `optional` **listQuery?**: `boolean` \| [`ListQueryOptions`](ListQueryOptions.md)

Defined in: [crud.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/drizzle/src/crud.ts#L20)

Declare list query params (page/perPage/sort/order/q) on the list route. Default true; pass options to scope.

***

### softDelete?

> `optional` **softDelete?**: `boolean` \| \{ `column?`: `string`; \}

Defined in: [crud.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/drizzle/src/crud.ts#L25)

SOFT delete: DELETE marks the row (sets a deletedAt column) instead of removing it, so the projected DELETE
returns the affected row (200), not 204. The patch is built at runtime by `softDeleteValues`.
