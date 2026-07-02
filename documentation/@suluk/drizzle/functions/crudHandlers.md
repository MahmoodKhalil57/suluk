[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / crudHandlers

# Function: crudHandlers()

> **crudHandlers**(`table`, `opts`): [`CrudHandlers`](../interfaces/CrudHandlers.md)

Defined in: [handlers.ts:51](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/drizzle/src/handlers.ts#L51)

Build the five gated CRUD handlers for a drizzle table. The dev + worker callers differ ONLY in `opts.db`.

## Parameters

### table

`SQLiteTable`

### opts

[`CrudHandlerOptions`](../interfaces/CrudHandlerOptions.md)

## Returns

[`CrudHandlers`](../interfaces/CrudHandlers.md)
