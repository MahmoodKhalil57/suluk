[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / crudHandlers

# Function: crudHandlers()

> **crudHandlers**(`table`, `opts`): [`CrudHandlers`](../interfaces/CrudHandlers.md)

Defined in: [handlers.ts:51](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/drizzle/src/handlers.ts#L51)

Build the five gated CRUD handlers for a drizzle table. The dev + worker callers differ ONLY in `opts.db`.

## Parameters

### table

`SQLiteTable`

### opts

[`CrudHandlerOptions`](../interfaces/CrudHandlerOptions.md)

## Returns

[`CrudHandlers`](../interfaces/CrudHandlers.md)
