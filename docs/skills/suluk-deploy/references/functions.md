# Functions

## sql

### `schemaToSql`
A full schema.sql for the app's entities.
```ts
schemaToSql(entities: DeployEntity[]): string
```
**Parameters:**
- `entities: DeployEntity[]`
**Returns:** `string`

### `createTable`
CREATE TABLE for one entity (or a manual-define comment for a $ref/boolean schema).
```ts
createTable(entity: DeployEntity): string
```
**Parameters:**
- `entity: DeployEntity`
**Returns:** `string`

### `entityColumns`
The columns of an entity, in DDL order (id is a synthesized autoincrement PK when absent). [] for a $ref/boolean.
```ts
entityColumns(entity: DeployEntity): ColumnDef[]
```
**Parameters:**
- `entity: DeployEntity`
**Returns:** `ColumnDef[]`

### `columnDdl`
The DDL fragment for one column.
```ts
columnDdl(c: ColumnDef): string
```
**Parameters:**
- `c: ColumnDef`
**Returns:** `string`

### `tableName`
The SQLite table name for an entity.
```ts
tableName(entity: DeployEntity): string
```
**Parameters:**
- `entity: DeployEntity`
**Returns:** `string`

## migrate

### `migrationSql`
The SQL to migrate from `prev` entities to `next` entities — additive only.
```ts
migrationSql(prev: DeployEntity[], next: DeployEntity[]): string
```
**Parameters:**
- `prev: DeployEntity[]`
- `next: DeployEntity[]`
**Returns:** `string`

## secrets

### `secretPushPlan`
The steps to push the named secrets to a Worker. Default: one interactive `wrangler secret put NAME` per secret
(the value is typed at the prompt — never on the command line). `bulk` instead emits a single
`wrangler secret bulk` step + a note to generate the JSON from the DECRYPTED env (@suluk/env decrypt-from-PQC).
```ts
secretPushPlan(secretNames: string[], opts: { workerName: string; bulk?: boolean }): SecretPushPlan
```
**Parameters:**
- `secretNames: string[]`
- `opts: { workerName: string; bulk?: boolean }` — default: `...`
**Returns:** `SecretPushPlan`

### `durableBindings`
The durable bindings a contract needs, derived from its facets: a rate-limit budget (x-suluk-ratelimit) needs a
KV counter store; a declared cost (x-suluk-cost) needs a KV sink. Emits the binding list + the
`wrangler kv namespace create` steps (the host runs them, then fills the ids into wrangler.jsonc).
```ts
durableBindings(doc: OpenAPIv4Document, appName: string): BindingPlan
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `appName: string` — default: `"app"`
**Returns:** `BindingPlan`

## storage

### `r2Storage`
Cloudflare R2 storage (the reference StorageProvider). `publicBaseUrl` is the bucket's served domain.
```ts
r2Storage(bucket: R2BucketLike, opts: { publicBaseUrl: string }): StorageProvider
```
**Parameters:**
- `bucket: R2BucketLike`
- `opts: { publicBaseUrl: string }`
**Returns:** `StorageProvider`

### `memoryStorage`
A DEV in-memory storage (per-process; not durable) — the swap default for local/tests, never production.
```ts
memoryStorage(opts: { publicBaseUrl?: string }): StorageProvider & { has: any }
```
**Parameters:**
- `opts: { publicBaseUrl?: string }` — default: `{}`
**Returns:** `StorageProvider & { has: any }`
