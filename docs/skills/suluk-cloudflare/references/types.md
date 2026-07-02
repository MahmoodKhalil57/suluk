# Types & Enums

## resources

### `D1Database`
**Properties:**
- `uuid: string`
- `name: string`

### `KvNamespace`
**Properties:**
- `id: string`
- `title: string`

### `Migration`
**Properties:**
- `name: string` — a stable identifier (e.g. the file name) — recorded in the ledger so it runs at most once.
- `sql: string`

## assets

### `AssetFile`
One asset: its server path (e.g. "/index.html"), bytes, and content type.
**Properties:**
- `path: string`
- `bytes: Uint8Array`
- `contentType: string`

### `UploadSession`
**Properties:**
- `jwt: string`
- `buckets: string[][]` (optional) — the file hashes (grouped into buckets) the API still needs uploaded; empty when everything is cached.

### `AssetRuleFiles`
The result of splitting Workers-Assets rule files out of an asset list.
**Properties:**
- `assets: AssetFile[]` — the remaining files to actually upload + serve.
- `_headers: string` (optional) — raw `_headers` file contents, if present — passed in the worker metadata's assets.config, NOT uploaded.
- `_redirects: string` (optional) — raw `_redirects` file contents, if present.

## worker

### `WorkerBinding`
**Properties:**
- `type: string`
- `name: string`

### `WorkerMigration`
A Durable Object migration, INLINE in the script-upload metadata (NOT the D1 `Migration` in resources.ts — that
is SQL run against a database; this is a declarative tag that tells Workers a DO class exists and which storage
backend it uses). NB the wire field is `new_tag` (+ optional `old_tag`), unlike wrangler.jsonc which uses `tag`.
`new_sqlite_classes` is what the Agents SDK + the Workers free plan require; `new_classes` is the legacy KV backend.
**Properties:**
- `new_tag: string` — the migration tag this upload advances to (e.g. "v1").
- `old_tag: string` (optional) — the tag the server must currently be at — optimistic concurrency; omit on the first deploy.
- `new_sqlite_classes: string[]` (optional) — classes to create with the SQLite storage backend (Agents SDK requirement).
- `new_classes: string[]` (optional) — classes to create with the legacy key-value backend (Paid plan only).
- `renamed_classes: { from: string; to: string }[]` (optional)
- `deleted_classes: string[]` (optional)

## deploy

### `DeployPlan`
**Properties:**
- `scriptName: string`
- `module: string` — the bundled worker ES module.
- `mainModule: string` (optional)
- `compatibilityDate: string`
- `compatibilityFlags: string[]` (optional)
- `d1: { binding: string; databaseName: string; migrations?: Migration[] }` (optional) — provision + bind a D1 database, applying each migration once (ledger-tracked, baseline-safe).
- `kv: { binding: string; title: string }[]` (optional) — provision + bind KV namespaces (binding → title).
- `r2: { binding: string; bucketName: string }[]` (optional) — provision + bind R2 buckets (binding → bucketName).
- `durableObjects: DurableObjectBinding[]` (optional) — bind Durable Object agents (Cloudflare Agents SDK runtime) + create same-script classes via an inline migration.
- `prevDurableObjects: DurableObjectBinding[]` (optional) — the previously-deployed DO class set. When given, the inline migration creates ONLY the classes added since (a true
 `old_tag`→`new_tag` delta); a removed class is logged (never auto-dropped), a backend-flip throws. Omit on first deploy.
- `durableObjectMigration: { newTag?: string; oldTag?: string }` (optional) — the DO migration tags — `newTag` defaults to "v1"; pass `oldTag` on a redeploy that ADDS classes (optimistic concurrency).
- `assets: AssetFile[]` (optional) — static assets to serve (uploaded; bound as ASSETS by default).
- `assetsBinding: string` (optional)
- `assetsConfig: Record<string, unknown>` (optional)
- `vars: Record<string, string>` (optional) — plain-text vars.
- `secrets: Record<string, string | undefined>` (optional) — encrypted secrets (empty values skipped).
- `crons: string[]` (optional) — cron triggers.
- `observability: boolean` (optional)

### `DeployResult`
**Properties:**
- `accountId: string`
- `scriptName: string`
- `d1: { binding: string; id: string }` (optional)
- `kv: { binding: string; id: string }[]`
- `r2: { binding: string; name: string }[]`
- `durableObjects: { binding: string; className: string }[]`
- `durableObjectsRemoved: string[]` — DO classes present in `prevDurableObjects` but gone from this deploy — orphaned (NOT dropped); a manual decision to delete.
- `assetsUploaded: number`
- `secretsSet: string[]`
- `crons: string[]`

### `DeployLog`
```ts
(msg: string) => void
```

### `DurableObjectBinding`
A Durable Object class to bind + (for same-script classes) create via an inline script migration. Mirrors
 `@suluk/deploy`'s `DurableObjectBinding` so the CLI plan and the no-wrangler REST deploy describe DO agents alike.
**Properties:**
- `binding: string` — the binding name exposed as `env.<binding>`.
- `className: string` — the exported Agent/DO class name.
- `sqlite: boolean` (optional) — SQLite-backed storage — REQUIRED by the Agents SDK + the free plan. Default true ⇒ `new_sqlite_classes`.
- `scriptName: string` (optional) — cross-script DO: the script that DEFINES the class. Omit for a same-script class (the only kind we migrate).

## ratelimit

### `RateLimitStore`
Matches @suluk/hono's RateLimitStore (structural — satisfies enforceRateLimit's `store` without a package dep).

### `ConsumeResult`
**Properties:**
- `limited: boolean`
- `remaining: number`
- `retryAfterMs: number`

### `KvLike`
The slice of the Workers KV API this needs (get/put with TTL).
