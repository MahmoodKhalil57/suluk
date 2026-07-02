# Types & Enums

## types

### `DeployProvider`
A deployment target. Pure: it produces the plan; the host executes the steps (with the user's credentials).
**Properties:**
- `name: string`

### `DeployPlan`
`@suluk/deploy` — ship a Suluk app behind a SWAPPABLE target interface. A DeployProvider turns the app into
the files + ordered steps that deploy it; the host (the vscode extension) runs the steps in a terminal
after the user authenticates. Cloudflare is the first provider (Workers + D1 + static assets) — an adapter,
since the stack is already Cloudflare-native (Hono=Workers, sqlite-core=D1, frontend=assets). CANDIDATE.
**Properties:**
- `provider: string`
- `files: DeployFile[]`
- `steps: DeployStep[]`
- `notes: string[]` — Human-facing notes (auth, manual fill-ins, caveats).

### `DeployInput`
`@suluk/deploy` — ship a Suluk app behind a SWAPPABLE target interface. A DeployProvider turns the app into
the files + ordered steps that deploy it; the host (the vscode extension) runs the steps in a terminal
after the user authenticates. Cloudflare is the first provider (Workers + D1 + static assets) — an adapter,
since the stack is already Cloudflare-native (Hono=Workers, sqlite-core=D1, frontend=assets). CANDIDATE.
**Properties:**
- `name: string` — App name (slugified by the provider for resource names).
- `entities: DeployEntity[]` — The data entities (for the database schema).
- `appModule: string` (optional) — Path, in the user's project, to the module exporting the Hono `app` (default "./src/app").
- `assetsDir: string` (optional) — Built frontend assets directory served as static files (default "./dist/client").
- `compatibilityDate: string` (optional) — Worker runtime compatibility date (default DEFAULT_COMPAT_DATE). Pass today's date in production.
- `preview: boolean` (optional) — Emit a PREVIEW deployment variant (charter-bounded role-preview): a `${slug}-preview` Worker with the
 two fail-closed locks — a `SULUK_PREVIEW="1"` var + a `PREVIEW_DB` D1 binding on an isolated
 `${slug}-preview-db` — plus a seed.sql with one throwaway demo user per role. Prod plans never set these.
- `previewRoles: string[]` (optional) — The roles to seed for a preview deployment (from the contract's User.role enum; cockpit threads them in).
- `durableObjects: DurableObjectBinding[]` (optional) — Durable Object classes to bind + migrate (the Cloudflare Agents SDK runtime surface). When present, the
generated wrangler.jsonc gains a `durable_objects.bindings` block and an additive `migrations` entry that
creates the SQLite-backed classes. Same-script classes only are migrated; a cross-script class (with
`scriptName`) is bound but migrated by its OWNING script. Empty/absent ⇒ no DO output (unchanged plan).
- `prevDurableObjects: DurableObjectBinding[]` (optional) — The previously-deployed DO class set. When given, the generated `migrations` become an ADDITIVE 2-step history
(recreate prev under `prevDurableObjectMigrationTag`, then create only the classes added since under the new tag)
instead of a from-scratch first-deploy entry; a removed class is flagged in `notes` (never auto-dropped), and a
class that changed storage backend (sqlite↔legacy) throws. Omit on a first deploy. NB this reconstructs at most a
2-step history — beyond one evolution the user owns the append-only `migrations` array.
- `durableObjectMigrationTag: string` (optional) — the migration tag for the DO classes above. Default "v1" on first deploy, "v2" when `prevDurableObjects` is given.
- `prevDurableObjectMigrationTag: string` (optional) — the tag the `prevDurableObjects` set was created under (default "v1") — the first step of the reconstructed history.

### `DeployEntity`
`@suluk/deploy` — ship a Suluk app behind a SWAPPABLE target interface. A DeployProvider turns the app into
the files + ordered steps that deploy it; the host (the vscode extension) runs the steps in a terminal
after the user authenticates. Cloudflare is the first provider (Workers + D1 + static assets) — an adapter,
since the stack is already Cloudflare-native (Hono=Workers, sqlite-core=D1, frontend=assets). CANDIDATE.
**Properties:**
- `name: string`
- `schema: SchemaOrRef`

### `DeployFile`
A file the provider wants written into the project.
**Properties:**
- `path: string`
- `content: string`

### `DeployStep`
One ordered shell step the host (the vscode extension) runs in a terminal AFTER the user authenticates.
**Properties:**
- `cmd: string`
- `note: string`

### `DurableObjectBinding`
A Durable Object class to bind + migrate. The Cloudflare Agents SDK runs each agent as a SQLite-backed Durable
Object, so a deploy that ships agents must emit BOTH a `durable_objects.bindings` entry AND a `migrations` entry
that creates the class. `@suluk/deploy` stays decoupled from the agent contract: the CALLER (the cockpit, or
`@suluk/agents`' future `projectCloudflareAgent`) computes which agents are Durable Objects and passes them here.
**Properties:**
- `binding: string` — the binding name exposed as `env.<binding>` (e.g. "WeatherAssistant").
- `className: string` — the exported Agent/DO class name (`class WeatherAssistant extends Agent {…}`).
- `sqlite: boolean` (optional) — SQLite-backed storage — REQUIRED by the Agents SDK and the Workers free plan. Default true ⇒ `new_sqlite_classes`.
- `scriptName: string` (optional) — cross-script DO: the script that DEFINES the class. Omit for a same-script class (the only kind we migrate).

## sql

### `ColumnDef`
One column, structured — shared by the full-schema emitter and the migration-delta.
**Properties:**
- `name: string`
- `type: string`
- `notNull: boolean`
- `pk: boolean`

## secrets

### `SecretPushPlan`
**Properties:**
- `steps: DeployStep[]`
- `notes: string[]`

### `BindingPlan`
**Properties:**
- `bindings: DurableBinding[]`
- `steps: DeployStep[]`
- `notes: string[]`

### `DurableBinding`
**Properties:**
- `kind: "kv" | "do" | "r2" | "queue"`
- `binding: string` — the binding name the Worker code reads (e.g. RATE_LIMIT).
- `resource: string` — the resource name to create.
- `reason: string` — why the contract needs it.

## storage

### `StorageProvider`
The swappable storage binding (the builder `storage` slot). Other providers (S3/GCS) implement the same shape.
**Properties:**
- `id: string` — a stable id (matches the @suluk/builder storage-slot impl id, e.g. "r2").

### `StoredObject`
A stored object — its key + the public URL to reach it.
**Properties:**
- `key: string`
- `url: string`

### `R2BucketLike`
The minimal Workers R2 surface this binding calls — satisfied by the real `R2Bucket` and by a mock.
