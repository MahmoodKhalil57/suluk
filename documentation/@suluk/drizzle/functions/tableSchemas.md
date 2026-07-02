[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / tableSchemas

# Function: tableSchemas()

> **tableSchemas**(`table`): [`TableZodSchemas`](../interfaces/TableZodSchemas.md)

Defined in: [schemas.ts:35](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/drizzle/src/schemas.ts#L35)

Build the select / insert / update Zod schemas for a table.
update = insert.partial() — the canonical PATCH body (any subset of writable columns).

## Parameters

### table

`Table`

## Returns

[`TableZodSchemas`](../interfaces/TableZodSchemas.md)
