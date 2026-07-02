[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / TableMeta

# Interface: TableMeta

Defined in: [meta.ts:40](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/drizzle/src/meta.ts#L40)

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

## Properties

### columns

> **columns**: [`ColumnMeta`](ColumnMeta.md)[]

Defined in: [meta.ts:46](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/drizzle/src/meta.ts#L46)

***

### name

> **name**: `string`

Defined in: [meta.ts:41](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/drizzle/src/meta.ts#L41)

***

### primaryKey

> **primaryKey**: `string`[]

Defined in: [meta.ts:43](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/drizzle/src/meta.ts#L43)

Column names flagged `primary` (ordered as drizzle reports the columns).

***

### unique

> **unique**: `string`[]

Defined in: [meta.ts:45](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/drizzle/src/meta.ts#L45)

Column names carrying a UNIQUE constraint (the natural keys for upsert / by-field lookup).
