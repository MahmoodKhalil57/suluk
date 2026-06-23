<p align="center">
  <a href="https://github.com/MahmoodKhalil57/suluk">
    <img src="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/wordmark.png" alt="Suluk" width="360" />
  </a>
</p>

<h1 align="center">@suluk/deploy</h1>

<p align="center"><b>Turn a Suluk app into the files + ordered steps that ship it — behind a swappable provider interface. Cloudflare is the first adapter.</b></p>

<p align="center">
  <em>Part of <a href="https://github.com/MahmoodKhalil57/suluk">Suluk</a> — one typed OpenAPI v4 contract projecting into every full-stack layer.</em>
</p>

---

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```sh
bun add @suluk/deploy
```

## What it does

A `DeployProvider` is a **pure** function: it takes your app's entities and produces a `DeployPlan` — the
files to write into the project + the ordered shell steps to run. It never executes anything and never
touches your credentials. The host (the VS Code cockpit, or your own script) writes the files and runs the
steps in a terminal *after the user authenticates*.

- **`cloudflare` provider** — emits `wrangler.jsonc`, a `worker.ts` (your Hono `app` as the Worker default
  export), and `schema.sql` (a D1/SQLite schema derived from your entities), plus the ordered `wrangler`
  steps (`login` → `d1 create` → apply schema → `deploy`). It's an *adapter*, not a rewrite: the stack is
  already Cloudflare-native (Hono = Workers, sqlite-core = D1, built frontend = static assets).
- **`schemaToSql` / `migrationSql`** — project a contract's entities to D1 DDL. `migrationSql` diffs a
  previously-deployed contract against the new one and emits **additive-only** SQL (CREATE new tables, ALTER
  ADD new columns; a removed table/column is *flagged*, never DROPped — losing data is a human decision).
- **`secretPushPlan` / `durableBindings`** — derive the deploy-time plan from the contract. `secretPushPlan`
  emits `wrangler secret put` steps that never hold a value. `durableBindings` reads the contract's
  `x-suluk-*` facets and provisions the durable infra they imply (a rate-limit budget → a KV counter; a
  declared cost → a KV sink; a bound storage slot → an R2 bucket).
- **Durable Object agents** — pass `durableObjects: [{ binding, className }]` (the Cloudflare Agents SDK runs each
  agent as a SQLite-backed Durable Object) and the generated `wrangler.jsonc` gains a `durable_objects.bindings`
  block + an additive `migrations: [{ tag, new_sqlite_classes }]` entry (`nodejs_compat` stays on; `sqlite: false`
  routes a class to the legacy `new_classes`). It is a **first-deploy artifact**: the generator emits the current
  class set under one tag — evolving agents (append a new tag for an added class; a removed class is *not* auto-flagged,
  unlike `migrationSql`) is a hand-edit today, tracked as a follow-up. The package stays decoupled from the agent
  contract — the caller (`@suluk/agents`' future `projectCloudflareAgent`) computes which agents are Durable Objects.
- **`r2Storage` / `memoryStorage`** — the swappable `StorageProvider` (the media/upload slot): R2 for
  production, an in-memory impl for dev/tests. `delete` is a first-class GDPR erasure target.
- **Preview deployments** — opt-in role-preview variant (`preview: true`) with two fail-closed locks and a
  sanitized throwaway seed (see [Preview](#preview-role-preview-deployments)).

## When to reach for it

- You have a Suluk app (a v4 contract → Hono API + sqlite-core data floor + built frontend) and want to
  **generate the deploy artifacts** — `wrangler` config, the Worker entry, the D1 schema — rather than
  hand-write them.
- You want **provider-agnostic** deploy: code against `DeployProvider` / `providers` so a future Vercel / Fly
  / self-hosted target is a new adapter, not a rewrite.
- You're evolving a deployed contract and need the **additive migration** to walk D1 forward safely.

When **not** to: this package plans and emits; it does not run `wrangler` or hold a Cloudflare token. If you
want the cockpit to write the files and open a terminal for you, that orchestration lives in `@suluk/cockpit`
(which calls this package). The raw "execute the bytes against your account" seam is `@suluk/cloudflare`.

## Usage

### Generate a Cloudflare deploy plan

```ts
import { cloudflare, type DeployInput } from "@suluk/deploy";
import { zodToV4 } from "@suluk/zod";
import * as z from "zod";

const input: DeployInput = {
  name: "My Petshop",                 // slugified for resource names → "my-petshop"
  appModule: "./src/app",             // module exporting your Hono `app` (default "./src/app")
  assetsDir: "./dist/client",         // built frontend, served as static assets (default "./dist/client")
  entities: [
    { name: "Pet", schema: zodToV4(z.object({
        id: z.number().int().optional(), name: z.string(),
        status: z.enum(["available", "sold"]), price: z.number(),
      })).schema },
    { name: "Category", schema: zodToV4(z.object({ id: z.number().int().optional(), name: z.string() })).schema },
  ],
};

const plan = cloudflare.generate(input);

plan.files;   // [{ path: "wrangler.jsonc", content }, { path: "worker.ts", … }, { path: "schema.sql", … }]
plan.steps;   // ordered: wrangler login → d1 create → d1 execute schema.sql → wrangler deploy
plan.notes;   // human-facing caveats (auth-in-terminal, the database_id fill-in, swappable-by-design)

// The host writes plan.files into the project, then runs plan.steps in a terminal:
for (const f of plan.files) await Bun.write(f.path, f.content);
for (const s of plan.steps) console.log(`# ${s.note}\n${s.cmd}`);
```

### Use the provider registry (the swappable point)

```ts
import { providers, type DeployProvider } from "@suluk/deploy";

const provider: DeployProvider = providers.cloudflare; // pick a target by name
const plan = provider.generate(input);
// New targets are new adapters registered here — the DeployProvider interface is the contract.
```

### Project entities to D1 SQL, on their own

```ts
import { schemaToSql, migrationSql } from "@suluk/deploy";

// Full schema.sql for a fresh deploy:
schemaToSql(input.entities);
// → "CREATE TABLE IF NOT EXISTS pet ( id INTEGER PRIMARY KEY AUTOINCREMENT, … );"

// Additive migration from the previously-deployed entities to the new contract's:
migrationSql(prevEntities, nextEntities);
// → ALTER TABLE … ADD COLUMN sku TEXT;  (a new required column is added NULLABLE + noted;
//   a removed column/table is flagged with a comment, never DROPped)
```

### Plan secret-push + facet-derived durable bindings

```ts
import { secretPushPlan, durableBindings } from "@suluk/deploy";

// One interactive `wrangler secret put` per secret — the value is typed at the prompt, never in a file:
secretPushPlan(["RESEND_API_KEY", "STRIPE_SECRET_KEY"], { workerName: "shop" }).steps;
// → DeployStep[]: [{ cmd: "wrangler secret put RESEND_API_KEY --name shop", note }, { cmd: "wrangler secret put STRIPE_SECRET_KEY --name shop", note }]
// Pass { bulk: true } for a single `wrangler secret bulk` step (reads values from a decrypted env file).

// Durable infra falls out of the contract's facets (x-suluk-ratelimit → KV, x-suluk-cost → KV,
// x-suluk-providers.storage → R2):
const { bindings, steps } = durableBindings(doc, "shop");
// bindings: [{ kind: "kv", binding: "RATE_LIMIT", resource: "shop-ratelimit", reason: … }, …]
```

### The storage slot (`StorageProvider`)

```ts
import { r2Storage, memoryStorage } from "@suluk/deploy";

// Production: a duck-typed R2 bucket binding (the real Workers `R2Bucket` satisfies it).
const media = r2Storage(env.MEDIA, { publicBaseUrl: "https://cdn.acme.test/" });
const { key, url } = await media.put("avatars/u1.png", bytes, { contentType: "image/png" });
media.urlFor("avatars/u1.png"); // the public URL (no I/O)
await media.delete("avatars/u1.png"); // the GDPR erasure path

// Dev / tests: an in-memory swap (never production).
const dev = memoryStorage();
await dev.put("k1", "data");
dev.has("k1"); // true
```

### Preview (role-preview deployments)

`generate({ …, preview: true, previewRoles })` emits a charter-bounded `${slug}-preview` Worker that mounts a
`/preview/login` backdoor guarded by **two** independent fail-closed locks (a `SULUK_PREVIEW="1"` var **and** a
`PREVIEW_DB` D1 binding) plus a `seed.sql` of throwaway demo users — one per role, with role names sanitized so a
hostile role can never be injected into SQL. A production plan sets none of it, so the backdoor is inert there. The
steps include a teardown (`wrangler delete`), because a standing preview is a live credentialed surface.

```ts
const preview = cloudflare.generate({ ...input, preview: true, previewRoles: ["admin", "editor"] });
// files now also include seed.sql; steps include `wrangler delete` to tear the preview down when done.
```

## API

| Export | What it does |
| --- | --- |
| `cloudflare` | The Cloudflare `DeployProvider` (Workers + D1 + static assets). |
| `providers` | The provider registry (`{ cloudflare }`) — pick a target by name. |
| `DEFAULT_COMPAT_DATE` | The default Worker compatibility date (pass today's date in production). |
| `schemaToSql(entities)` | A full D1 `schema.sql` for the app's entities. |
| `migrationSql(prev, next)` | Additive-only D1 migration between two contract versions. |
| `createTable`, `entityColumns`, `columnDdl`, `tableName` | The schema→SQL building blocks (`ColumnDef`). |
| `secretPushPlan(names, opts)` | `wrangler secret put` / `secret bulk` steps that never hold a value. |
| `durableBindings(doc, appName?)` | KV / R2 bindings derived from the contract's `x-suluk-*` facets. |
| `r2Storage(bucket, opts)` | The reference R2 `StorageProvider`. |
| `memoryStorage(opts?)` | An in-memory `StorageProvider` for dev/tests. |

Types: `DeployProvider`, `DeployPlan`, `DeployInput`, `DeployEntity`, `DeployFile`, `DeployStep`,
`ColumnDef`, `SecretPushPlan`, `BindingPlan`, `DurableBinding`, `StorageProvider`, `StoredObject`,
`R2BucketLike`.

## Boundary

This package sits on the right side of the **L3 line — render/generate, never host**. A provider produces a
*plan* (files + steps) and runs nothing; the host executes the steps against the user's own account, and auth
happens in *their* terminal (`wrangler login`, OAuth) so credentials never pass through Suluk. The seam is
intentional: **inject the db / inject the bytes** — `r2Storage` takes the R2 bucket binding as an argument,
`secretPushPlan` never reads a secret value, `durableBindings` only emits the create steps you run. Nothing
here becomes a black box the app must call home to. New targets (Vercel, Fly, self-hosted) are new adapters
behind the same `DeployProvider` interface — that's the whole point.

## License

Apache-2.0
