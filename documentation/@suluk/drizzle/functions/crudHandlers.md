[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / crudHandlers

# Function: crudHandlers()

> **crudHandlers**(`table`, `opts`): [`CrudHandlers`](../interfaces/CrudHandlers.md)

Defined in: [handlers.ts:51](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/drizzle/src/handlers.ts#L51)

Build the five gated CRUD handlers for a drizzle table. The dev + worker callers differ ONLY in `opts.db`.

## Parameters

### table

`SQLiteTable`

### opts

[`CrudHandlerOptions`](../interfaces/CrudHandlerOptions.md)

## Returns

[`CrudHandlers`](../interfaces/CrudHandlers.md)
