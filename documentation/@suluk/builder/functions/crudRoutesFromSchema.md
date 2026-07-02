[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / crudRoutesFromSchema

# Function: crudRoutesFromSchema()

> **crudRoutesFromSchema**(`name`, `schema`, `defs?`): [`RouteContract`](../../hono/interfaces/RouteContract.md)[]

Defined in: [fullstack.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/builder/src/fullstack.ts#L29)

Generate backend CRUD RouteContracts from an entity's v4 schema (schemas → Zod for the bodies).

## Parameters

### name

`string`

### schema

[`SchemaOrRef`](../../core/type-aliases/SchemaOrRef.md)

### defs?

`Record`\<`string`, [`SchemaOrRef`](../../core/type-aliases/SchemaOrRef.md)\>

## Returns

[`RouteContract`](../../hono/interfaces/RouteContract.md)[]
