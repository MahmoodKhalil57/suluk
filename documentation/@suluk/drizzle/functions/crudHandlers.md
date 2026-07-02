[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / crudHandlers

# Function: crudHandlers()

> **crudHandlers**(`table`, `opts`): [`CrudHandlers`](../interfaces/CrudHandlers.md)

Defined in: [handlers.ts:51](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/drizzle/src/handlers.ts#L51)

Build the five gated CRUD handlers for a drizzle table. The dev + worker callers differ ONLY in `opts.db`.

## Parameters

### table

`SQLiteTable`

### opts

[`CrudHandlerOptions`](../interfaces/CrudHandlerOptions.md)

## Returns

[`CrudHandlers`](../interfaces/CrudHandlers.md)
