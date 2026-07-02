# Functions

## meta

### `tableMetadata`
Read a drizzle table's metadata. This is the honest floor: every value comes from the column descriptor,
nothing is inferred. `enumValues` is only present when the underlying column actually carries one — we
don't synthesize an empty array (that would be a silent invention).
```ts
tableMetadata(table: Table): TableMeta
```
**Parameters:**
- `table: Table`
**Returns:** `TableMeta`

### `pascalCase`
"user_accounts" / "users" → "UserAccounts" / "Users". The v4 component key (C009 by-name).
```ts
pascalCase(s: string): string
```
**Parameters:**
- `s: string`
**Returns:** `string`

### `tableComponentName`
A drizzle table's PascalCase component name, derived from its SQL name.
```ts
tableComponentName(table: Table): string
```
**Parameters:**
- `table: Table`
**Returns:** `string`

## schemas

### `tableSchemas`
Build the select / insert / update Zod schemas for a table.
update = insert.partial() — the canonical PATCH body (any subset of writable columns).
```ts
tableSchemas(table: Table): TableZodSchemas
```
**Parameters:**
- `table: Table`
**Returns:** `TableZodSchemas`

### `tableToV4`
Lift a table's three Zod schemas to v4 Schema Objects via zodToV4. drizzle-zod produces plain object
schemas (no .transform/.refine), so this is lossless here — but we still honor the house rule and surface
any zodToV4 warnings rather than dropping them silently (see tableToV4Warnings).
```ts
tableToV4(table: Table): TableV4Schemas
```
**Parameters:**
- `table: Table`
**Returns:** `TableV4Schemas`

### `tableToV4Warnings`
Same conversion as tableToV4 but also returns the enumerated lossy boundary (per-projection
zodToV4 warnings). Empty arrays ⇒ fully lossless. Callers wanting the honest-loss accounting use this.
```ts
tableToV4Warnings(table: Table): { schemas: TableV4Schemas; warnings: { select: string[]; insert: string[]; update: string[] } }
```
**Parameters:**
- `table: Table`
**Returns:** `{ schemas: TableV4Schemas; warnings: { select: string[]; insert: string[]; update: string[] } }`

### `tableComponents`
Build a v4 components.schemas record from a set of tables: { [PascalName]: select-v4-schema }.
Keyed by the table's PascalCase name (C009 by-name). Collisions (two tables mapping to the same Pascal
name) are NOT silently merged — the last writer wins AND a warning is surfaced via tableComponentsAudit.
```ts
tableComponents(tables: readonly Table<TableConfig<Column<any, object, object>>>[]): Record<string, Schema>
```
**Parameters:**
- `tables: readonly Table<TableConfig<Column<any, object, object>>>[]`
**Returns:** `Record<string, Schema>`

### `tableComponentsAudit`
Like tableComponents but enumerates name collisions instead of dropping them silently.
```ts
tableComponentsAudit(tables: readonly Table<TableConfig<Column<any, object, object>>>[]): { schemas: Record<string, Schema>; collisions: string[] }
```
**Parameters:**
- `tables: readonly Table<TableConfig<Column<any, object, object>>>[]`
**Returns:** `{ schemas: Record<string, Schema>; collisions: string[] }`

## crud

### `crudRoutes`
Generate the five conventional CRUD RouteContracts for a drizzle table:
  - list   GET    {base}            → 200 array(select)
  - get    GET    {base}/:id        → 200 select, 404
  - create POST   {base}            (json insert) → 201 select
  - update PATCH  {base}/:id        (json update) → 200 select
  - delete DELETE {base}/:id        → 204
Names are list<Pascal>/get<Pascal>/create<Pascal>/update<Pascal>/delete<Pascal> (C009 by-name handles).
`:id` is typed as a string param (path params arrive as strings; the DB layer coerces).
```ts
crudRoutes(table: Table, opts: CrudOptions): RouteContract[]
```
**Parameters:**
- `table: Table`
- `opts: CrudOptions` — default: `{}`
**Returns:** `RouteContract[]`

## query

### `listQuerySchema`
The Zod query schema for a list route: page/perPage/sort/order/q (coerced from strings). Extra column filters
are read by parseListQuery at runtime (OpenAPI query params are flat, so they aren't enumerated here).
`table` is OPTIONAL: with a table (or `opts.columns`) `sort` is a column enum; without either it is a free string —
so the contract-projection layer (@suluk/builder), which holds a Zod entity rather than a Drizzle table, can call
`listQuerySchema()` and still emit the same five params into the v4 doc + SDK.
```ts
listQuerySchema(table?: Table<TableConfig<Column<any, object, object>>>, opts: ListQueryOptions): ZodType
```
**Parameters:**
- `table: Table<TableConfig<Column<any, object, object>>>` (optional)
- `opts: ListQueryOptions` — default: `{}`
**Returns:** `ZodType`

### `parseListQuery`
Normalize a raw query object into a ListQuery — pure, validating against the table's real columns:
page/perPage are clamped (≥1, ≤maxPerPage); `sort` is honored only for a real column; any other key matching a
column becomes an equality filter (unknown keys are ignored — no injection of arbitrary columns).
```ts
parseListQuery(raw: RawQuery, table: Table, opts: ListQueryOptions): ListQuery
```
**Parameters:**
- `raw: RawQuery`
- `table: Table`
- `opts: ListQueryOptions` — default: `{}`
**Returns:** `ListQuery`

## mutations

### `softDeleteValues`
The patch a soft delete applies — sets the deletedAt column to `now` (default current time).
```ts
softDeleteValues(opts: SoftDeleteOptions, now: Date): Record<string, string>
```
**Parameters:**
- `opts: SoftDeleteOptions` — default: `{}`
- `now: Date` — default: `...`
**Returns:** `Record<string, string>`

### `anonymizeValues`
The patch an anonymize-on-delete applies — redacts each named column to `value` (null by default). Pair with a
 soft-delete to keep the row (FK-safe right-to-be-forgotten).
```ts
anonymizeValues(columns: string[], value: string | null): Record<string, string | null>
```
**Parameters:**
- `columns: string[]`
- `value: string | null` — default: `null`
**Returns:** `Record<string, string | null>`

### `touchTimestamps`
The patch server-managed timestamps apply on write — `updatedAt` always, `createdAt` only when `creating`.
```ts
touchTimestamps(opts: TimestampOptions, creating: boolean, now: Date): Record<string, string>
```
**Parameters:**
- `opts: TimestampOptions` — default: `{}`
- `creating: boolean` — default: `false`
- `now: Date` — default: `...`
**Returns:** `Record<string, string>`

### `notSoftDeleted`
The implicit list filter for a soft-deleting table — exclude rows whose deletedAt is set (unless asked to include).
```ts
notSoftDeleted(column: string): { column: string; isNull: true }
```
**Parameters:**
- `column: string` — default: `"deletedAt"`
**Returns:** `{ column: string; isNull: true }`

## ddl

### `tableDDL`
`CREATE TABLE` DDL for one drizzle table (or its already-read metadata). Single-column primary keys only — a
table-level composite `primaryKey({columns})` isn't visible on the column-descriptor floor (it needs
dialect-specific `getTableConfig`, deferred like FK/relation projection); such a table emits its columns without
the composite constraint, so declare those tables' DDL by hand for now.
```ts
tableDDL(table: Table<TableConfig<Column<any, object, object>>> | TableMeta, opts: DdlOptions): string
```
**Parameters:**
- `table: Table<TableConfig<Column<any, object, object>>> | TableMeta`
- `opts: DdlOptions` — default: `{}`
**Returns:** `string`

### `schemaDDL`
`CREATE TABLE` DDL for many tables, newline-joined — the dev-schema twin of the prod migrations.
```ts
schemaDDL(tables: (Table<TableConfig<Column<any, object, object>>> | TableMeta)[], opts: DdlOptions): string
```
**Parameters:**
- `tables: (Table<TableConfig<Column<any, object, object>>> | TableMeta)[]`
- `opts: DdlOptions` — default: `{}`
**Returns:** `string`

## handlers

### `crudHandlers`
Build the five gated CRUD handlers for a drizzle table. The dev + worker callers differ ONLY in `opts.db`.
```ts
crudHandlers(table: SQLiteTable, opts: CrudHandlerOptions): CrudHandlers
```
**Parameters:**
- `table: SQLiteTable`
- `opts: CrudHandlerOptions`
**Returns:** `CrudHandlers`

## cas

### `rowsChanged`
The number of rows a write affected, normalized across drivers (0 when unknown).
```ts
rowsChanged(result: unknown): number
```
**Parameters:**
- `result: unknown`
**Returns:** `number`

### `claimOnce`
Atomically CLAIM a transition: `UPDATE table SET set WHERE where`, returning true iff this call changed a row.
The `where` MUST include the FROM-state guard (e.g. `and(eq(id, n), eq(status, "pending"))`) so a re-delivery /
concurrent caller finds the row already transitioned and changes nothing → returns false. The single point that
makes a once-only side-effect (charge, refund, decrement, email) safe to run when, and only when, the claim wins.
```ts
claimOnce(db: ClaimDb, table: unknown, where: SQL, set: Record<string, unknown>): Promise<boolean>
```
**Parameters:**
- `db: ClaimDb`
- `table: unknown`
- `where: SQL`
- `set: Record<string, unknown>`
**Returns:** `Promise<boolean>`

### `claimRows`
Atomically CLAIM a SET of rows and RETURN them: `UPDATE table SET set WHERE where RETURNING *`. The claim-then-act
variant of claimOnce — for a batch sweep (mark a waitlist notified / a cart-recovery emailed) where each
row must be handled exactly once even if the sweep overlaps: a concurrent run's UPDATE claims a DISJOINT set, so
the side-effect (email, notify) fires once per row. Returns the rows THIS call won; act only on those.
```ts
claimRows<T>(db: ClaimDb, table: unknown, where: SQL, set: Record<string, unknown>): Promise<T[]>
```
**Parameters:**
- `db: ClaimDb`
- `table: unknown`
- `where: SQL`
- `set: Record<string, unknown>`
**Returns:** `Promise<T[]>`
