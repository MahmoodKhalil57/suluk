# Types & Enums

## meta

### `AnyTable`
Any drizzle table object accepted by getTableColumns/getTableName. We stay structural — the concrete
 dialect type (SQLite/Pg/MySQL) is irrelevant here; we only read the column descriptor surface.
```ts
Parameters<typeof getTableColumns>[0]
```

### `ColumnMeta`
One column's metadata, lifted from drizzle's column descriptor (verified against drizzle-orm 0.45).
**Properties:**
- `name: string` — the JS property key on the table object (e.g. `reviewId`) — the v4 component property name.
- `sqlName: string` — the SQL column name (e.g. `review_id`) — what DDL + raw SQL must use; differs from `name` under camel/snake.
- `dataType: string` — drizzle's coarse JS dataType, e.g. "string" | "number" | "boolean" | "date".
- `columnType: string` — drizzle's concrete column type tag, e.g. "SQLiteText" | "SQLiteInteger".
- `notNull: boolean` — NOT NULL at the SQL level.
- `hasDefault: boolean` — Has a DB-side default (also true for autoincrement PKs) ⇒ optional on insert.
- `primaryKey: boolean` — Part of the (single-column) primary key.
- `autoIncrement: boolean` — An AUTOINCREMENT primary key (SQLite integer PK declared with autoIncrement).
- `unique: boolean` — Carries a column-level UNIQUE constraint (drizzle's `.unique()` / `isUnique`).
- `enumValues: string[]` (optional) — SQL CHECK/enum allowed values when the column was declared with `{ enum: [...] }`.
- `defaultValue: string | number | boolean` (optional) — The STATIC default value (number/string/boolean) when the column carries one — for DDL emit. Absent for a
 runtime `$defaultFn` column (hasDefault true, no SQL-literal value) and for autoincrement PKs.

### `TableMeta`
`@suluk/drizzle` — the DATA floor of the Suluk cycle: a Drizzle ORM table is the system of record, and this
package projects it into the v4 "Suluk" contract. The chain is

  Drizzle table
    → Zod (drizzle-zod: select / insert / update)        [tableSchemas]
    → v4 Schema Objects (@suluk/zod zodToV4)              [tableToV4, tableComponents]
    → Hono RouteContracts (the @suluk/hono interface)    [crudRoutes]
    → v4 document (@suluk/hono emitV4)                    [closes the floor-to-contract chain]

Plus the honest DB metadata read straight off the column descriptors [tableMetadata]. Losses are never
silent: the v4 conversion surfaces zodToV4 warnings (tableToV4Warnings) and component-name collisions
(tableComponentsAudit). CANDIDATE tooling (not official OAS).
**Properties:**
- `name: string`
- `primaryKey: string[]` — Column names flagged `primary` (ordered as drizzle reports the columns).
- `unique: string[]` — Column names carrying a UNIQUE constraint (the natural keys for upsert / by-field lookup).
- `columns: ColumnMeta[]`

## schemas

### `TableZodSchemas`
The three Zod projections of a table.
**Properties:**
- `select: ZodType` — Full row shape — every column required (createSelectSchema).
- `insert: ZodType` — Write shape — notNull-AND-no-default columns required; PK/defaulted/nullable relaxed (createInsertSchema).
- `update: ZodType` — Partial write shape — every insert field optional (insert.partial()), for PATCH.

### `TableV4Schemas`
The three v4 Schema Objects, mirroring TableZodSchemas.
**Properties:**
- `select: Schema`
- `insert: Schema`
- `update: Schema`

## query

### `ListQuery`
**Properties:**
- `limit: number` — rows to return (= perPage).
- `offset: number` — rows to skip (= (page-1)*perPage).
- `orderBy: { column: string; dir: "asc" | "desc" }` (optional)
- `q: string` (optional) — free-text search term.
- `filters: Record<string, string>` — column → equality value.
- `page: number`
- `perPage: number`

## handlers

### `CrudHandlers`
**Properties:**
- `list: (c: Context) => Promise<Response>`
- `get: (c: Context) => Promise<Response>`
- `create: (c: Context) => Promise<Response>`
- `update: (c: Context) => Promise<Response>`
- `delete: (c: Context) => Promise<Response>`

### `CrudDb`
Structural drizzle handle — the chainable builder API both bun:sqlite and D1 expose (loosely typed, like the app twins).
**Properties:**
- `select: (a: unknown[]) => any`
- `insert: (a: unknown[]) => any`
- `update: (a: unknown[]) => any`
- `delete: (a: unknown[]) => any`

## cas

### `WriteResult`
A drizzle `.run()` result across drivers (bun:sqlite / D1 / better-sqlite3).
```ts
{ changes?: number; rowsAffected?: number; meta?: { changes?: number } } | unknown
```

### `ClaimDb`
Minimal drizzle handle for a conditional update (bun:sqlite sync or D1 async — both awaited).
**Properties:**
- `update: (table: unknown) => { set: (values: Record<string, unknown>) => { where: (cond: SQL) => { run: () => unknown; returning: () => unknown } } }`
