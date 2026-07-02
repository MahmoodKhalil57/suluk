# Configuration

## CrudOptions

### Properties

#### basePath

Base path for the collection. Default "/" + tableName, e.g. "/users".

**Type:** `string`

#### idParam

Path-param name for the item id. Default "id" ⇒ ".../:id".

**Type:** `string`

#### listQuery

Declare list query params (page/perPage/sort/order/q) on the list route. Default true; pass options to scope.

**Type:** `boolean | ListQueryOptions`

#### softDelete

SOFT delete: DELETE marks the row (sets a deletedAt column) instead of removing it, so the projected DELETE
returns the affected row (200), not 204. The patch is built at runtime by `softDeleteValues`.

**Type:** `boolean | { column?: string }`

#### anonymizeDelete

ANONYMIZE on delete (GDPR keep-record): DELETE redacts these columns instead of removing the row. Like
softDelete, the projected DELETE returns the affected row (200). The patch comes from `anonymizeValues`.

**Type:** `{ columns: string[] }`

## ListQueryOptions

### Properties

#### columns

sortable + filterable columns (default: all of the table's columns).

**Type:** `string[]`

#### defaultPerPage

default page size (default 20).

**Type:** `number`

#### maxPerPage

max page size — `perPage` is clamped to it (default 100).

**Type:** `number`

## SoftDeleteOptions

CrudOptions runtime helpers (saastarter-parity Phase 1): pure value-builders for soft-delete, anonymize-on-delete,
and server-managed timestamps. The package projects CONTRACTS (it runs no SQL), so these produce the PATCH an
app's Drizzle handler applies — keeping the policy (which column is `deletedAt`, which columns to redact) in one
place. anonymizeValues is the row-level counterpart of @suluk/better-auth's GDPR erasure cascade (the keep-record,
FK-safe posture).

### Properties

#### column

the timestamp column set on delete (default "deletedAt").

**Type:** `string`

## TimestampOptions

### Properties

#### createdAt

**Type:** `string`

#### updatedAt

**Type:** `string`

## DdlOptions

### Properties

#### ifNotExists

prefix with `IF NOT EXISTS` (default true).

**Type:** `boolean`

## CrudHandlerOptions

### Properties

#### ownerCol

**Type:** `string`

#### access

**Type:** `AccessMode`

#### policies

override the default mode→policy preset (passed through to @suluk/hono's policyFor).

**Type:** `Record<AccessMode, Policy>`

#### db

resolve the drizzle instance for a request (dev: `() => db`; worker: `(c) => drizzle(c.env.DB)`).

**Type:** `(c: Context) => CrudDb`

**Required:** yes

#### principal

the verified caller id (token/session/x-user) — used for owner-scoping + the create owner-stamp.

**Type:** `(c: Context) => string | null`

**Required:** yes

#### isAdmin

whether the caller is an admin (e.g. `c.get("isAdmin") === true`).

**Type:** `(c: Context) => boolean`

**Required:** yes

#### redact

strip private columns from a row for a non-admin reader (no-op by default).

**Type:** `(tableName: string, row: AnyRow, admin: boolean) => AnyRow`

#### afterUpdate

post-update hook (e.g. back-in-stock on a restock); fires only for tables in `afterUpdateTables`.

**Type:** `(tableName: string, c: Context, db: CrudDb, before: AnyRow, after: AnyRow) => Promise<void>`

#### afterUpdateTables

**Type:** `ReadonlySet<string>`