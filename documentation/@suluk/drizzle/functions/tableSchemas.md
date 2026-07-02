[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / tableSchemas

# Function: tableSchemas()

> **tableSchemas**(`table`): [`TableZodSchemas`](../interfaces/TableZodSchemas.md)

Defined in: [schemas.ts:35](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/drizzle/src/schemas.ts#L35)

Build the select / insert / update Zod schemas for a table.
update = insert.partial() — the canonical PATCH body (any subset of writable columns).

## Parameters

### table

`Table`

## Returns

[`TableZodSchemas`](../interfaces/TableZodSchemas.md)
