[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / crudRoutes

# Function: crudRoutes()

> **crudRoutes**(`table`, `opts?`): [`RouteContract`](../../hono/interfaces/RouteContract.md)[]

Defined in: [crud.ts:43](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/drizzle/src/crud.ts#L43)

Generate the five conventional CRUD RouteContracts for a drizzle table:
  - list   GET    {base}            → 200 array(select)
  - get    GET    {base}/:id        → 200 select, 404
  - create POST   {base}            (json insert) → 201 select
  - update PATCH  {base}/:id        (json update) → 200 select
  - delete DELETE {base}/:id        → 204
Names are list<Pascal>/get<Pascal>/create<Pascal>/update<Pascal>/delete<Pascal> (C009 by-name handles).
`:id` is typed as a string param (path params arrive as strings; the DB layer coerces).

## Parameters

### table

`Table`

### opts?

[`CrudOptions`](../interfaces/CrudOptions.md) = `{}`

## Returns

[`RouteContract`](../../hono/interfaces/RouteContract.md)[]
