/**
 * `@suluk/drizzle` — the DATA floor of the Suluk cycle: a Drizzle ORM table is the system of record, and this
 * package projects it into the v4 "Suluk" contract. The chain is
 *
 *   Drizzle table
 *     → Zod (drizzle-zod: select / insert / update)        [tableSchemas]
 *     → v4 Schema Objects (@suluk/zod zodToV4)              [tableToV4, tableComponents]
 *     → Hono RouteContracts (the @suluk/hono interface)    [crudRoutes]
 *     → v4 document (@suluk/hono emitV4)                    [closes the floor-to-contract chain]
 *
 * Plus the honest DB metadata read straight off the column descriptors [tableMetadata]. Losses are never
 * silent: the v4 conversion surfaces zodToV4 warnings (tableToV4Warnings) and component-name collisions
 * (tableComponentsAudit). CANDIDATE tooling (not official OAS).
 */
export {
  tableMetadata,
  pascalCase,
  tableComponentName,
  type AnyTable,
  type ColumnMeta,
  type TableMeta,
} from "./meta";

export {
  tableSchemas,
  tableToV4,
  tableToV4Warnings,
  tableComponents,
  tableComponentsAudit,
  type TableZodSchemas,
  type TableV4Schemas,
} from "./schemas";

// INLINE zod on drizzle columns — `.zod(refiner)` co-locates a column's wire refinement WITH its DDL (a
// runtime augmentation of the SQLite column builder), then `tableZod`/`tableZodSchemas` read the whole table
// back as ONE annotated zod object to slice arbitrary operations (CRUD or not) from. Importing installs the
// `.zod()` method as a side effect.
export { tableZod, tableZodSchemas, wireDto, type ZodRefiner, type TableZodOptions } from "./inline-zod";

export { crudRoutes, type CrudOptions } from "./crud";
// list query-param synthesis (Phase 1): declare page/perPage/sort/order/q + the pure parser the handler uses.
export { listQuerySchema, parseListQuery, type ListQuery, type ListQueryOptions } from "./query";
// CrudOptions runtime helpers (Phase 1): soft-delete / anonymize-on-delete (GDPR keep-record) / timestamps patches.
export {
  softDeleteValues, anonymizeValues, touchTimestamps, notSoftDeleted,
  type SoftDeleteOptions, type TimestampOptions,
} from "./mutations";
// SQLite CREATE TABLE generator — build a dev in-memory schema FROM the Drizzle tables (no hand-mirrored SQL drift).
export { tableDDL, schemaDDL, type DdlOptions } from "./ddl";
// Driver-agnostic gated CRUD HANDLERS (the @suluk/hono gate engine over a drizzle table) — ONE impl for dev (bun:sqlite,
// sync) + worker (D1, async); the db is injected as a resolver, so the two runtimes share one factory, no twin drift.
export { crudHandlers, type CrudHandlers, type CrudHandlerOptions, type CrudDb } from "./handlers";
// once-only WRITE primitives — the race-safe compare-and-set skeleton for money/state-machine paths (normalize the
// affected-row count across drivers; claim a transition exactly once). The transitions/side-effects stay in the app.
export { rowsChanged, claimOnce, claimRows, type WriteResult, type ClaimDb } from "./cas";
