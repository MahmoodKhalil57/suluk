[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / TableZodSchemas

# Interface: TableZodSchemas

Defined in: [schemas.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/drizzle/src/schemas.ts#L15)

The three Zod projections of a table.

## Properties

### insert

> **insert**: `ZodType`

Defined in: [schemas.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/drizzle/src/schemas.ts#L19)

Write shape — notNull-AND-no-default columns required; PK/defaulted/nullable relaxed (createInsertSchema).

***

### select

> **select**: `ZodType`

Defined in: [schemas.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/drizzle/src/schemas.ts#L17)

Full row shape — every column required (createSelectSchema).

***

### update

> **update**: `ZodType`

Defined in: [schemas.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/drizzle/src/schemas.ts#L21)

Partial write shape — every insert field optional (insert.partial()), for PATCH.
