[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / crudHandlers

# Function: crudHandlers()

> **crudHandlers**(`table`, `opts`): [`CrudHandlers`](../interfaces/CrudHandlers.md)

Defined in: [handlers.ts:51](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/drizzle/src/handlers.ts#L51)

Build the five gated CRUD handlers for a drizzle table. The dev + worker callers differ ONLY in `opts.db`.

## Parameters

### table

`SQLiteTable`

### opts

[`CrudHandlerOptions`](../interfaces/CrudHandlerOptions.md)

## Returns

[`CrudHandlers`](../interfaces/CrudHandlers.md)
