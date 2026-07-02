[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / ColumnMeta

# Interface: ColumnMeta

Defined in: [meta.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/drizzle/src/meta.ts#L14)

One column's metadata, lifted from drizzle's column descriptor (verified against drizzle-orm 0.45).

## Properties

### autoIncrement

> **autoIncrement**: `boolean`

Defined in: [meta.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/drizzle/src/meta.ts#L30)

An AUTOINCREMENT primary key (SQLite integer PK declared with autoIncrement).

***

### columnType

> **columnType**: `string`

Defined in: [meta.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/drizzle/src/meta.ts#L22)

drizzle's concrete column type tag, e.g. "SQLiteText" | "SQLiteInteger".

***

### dataType

> **dataType**: `string`

Defined in: [meta.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/drizzle/src/meta.ts#L20)

drizzle's coarse JS dataType, e.g. "string" | "number" | "boolean" | "date".

***

### defaultValue?

> `optional` **defaultValue?**: `string` \| `number` \| `boolean`

Defined in: [meta.ts:37](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/drizzle/src/meta.ts#L37)

The STATIC default value (number/string/boolean) when the column carries one — for DDL emit. Absent for a
 runtime `$defaultFn` column (hasDefault true, no SQL-literal value) and for autoincrement PKs.

***

### enumValues?

> `optional` **enumValues?**: `string`[]

Defined in: [meta.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/drizzle/src/meta.ts#L34)

SQL CHECK/enum allowed values when the column was declared with `{ enum: [...] }`.

***

### hasDefault

> **hasDefault**: `boolean`

Defined in: [meta.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/drizzle/src/meta.ts#L26)

Has a DB-side default (also true for autoincrement PKs) ⇒ optional on insert.

***

### name

> **name**: `string`

Defined in: [meta.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/drizzle/src/meta.ts#L16)

the JS property key on the table object (e.g. `reviewId`) — the v4 component property name.

***

### notNull

> **notNull**: `boolean`

Defined in: [meta.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/drizzle/src/meta.ts#L24)

NOT NULL at the SQL level.

***

### primaryKey

> **primaryKey**: `boolean`

Defined in: [meta.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/drizzle/src/meta.ts#L28)

Part of the (single-column) primary key.

***

### sqlName

> **sqlName**: `string`

Defined in: [meta.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/drizzle/src/meta.ts#L18)

the SQL column name (e.g. `review_id`) — what DDL + raw SQL must use; differs from `name` under camel/snake.

***

### unique

> **unique**: `boolean`

Defined in: [meta.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/drizzle/src/meta.ts#L32)

Carries a column-level UNIQUE constraint (drizzle's `.unique()` / `isUnique`).
