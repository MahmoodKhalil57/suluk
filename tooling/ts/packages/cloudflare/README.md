<p align="center">
  <a href="https://github.com/MahmoodKhalil57/suluk">
    <img src="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/wordmark.png" alt="Suluk" width="360" />
  </a>
</p>

<h1 align="center">@suluk/cloudflare</h1>

<p align="center"><b>Provision + deploy a Suluk app to Cloudflare from one API call — no wrangler CLI.</b></p>

<p align="center">
  <em>Part of <a href="https://github.com/MahmoodKhalil57/suluk">Suluk</a> — one typed OpenAPI v4 contract projecting into every full-stack layer.</em>
</p>

---

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```sh
bun add @suluk/cloudflare
```

## What it does

A typed wrapper over the Cloudflare REST API that ships a Worker + its dependencies in dependency order, with no `wrangler` binary and no `wrangler.toml`.

- **`CloudflareClient`** — a thin, typed client over `https://api.cloudflare.com/client/v4` with Bearer auth, the standard `{ success, errors, result }` envelope unwrapped, and a `CloudflareError` that carries the API's own error codes (so a failed deploy says *why*). `fetch` is injectable, so the whole library is unit-testable without a network.
- **Idempotent provisioners** — `provisionD1` / `provisionKvNamespace` / `provisionR2Bucket` are create-or-get (re-running never errors with "already exists"), `applyMigrations` keeps a `_suluk_migrations` ledger so each migration runs at most once (and baselines a DB migrated before the ledger existed), and `putSecrets` skips empty values.
- **Workers static-assets upload** — `uploadAssets` builds the manifest, opens an upload session, and pushes only the buckets the API asks for (so a redeploy only sends changed files). `_headers` / `_redirects` are routed into the worker's `assets.config` as rules, not uploaded as serveable blobs.
- **One-call `deploy()`** — provision → migrate → upload assets → deploy the module worker (with bindings + vars) → push secrets → set cron triggers, in the order where each step's output feeds the next. `keep_bindings` preserves secrets across redeploys, so you set them once.
- **Durable Object agents** — pass `durableObjects: [{ binding, className }]` and `deploy()` binds each as a `durable_object_namespace` and creates the same-script classes via an inline script migration (`new_sqlite_classes`, the Agents SDK + free-plan backend). The migration rides the same script-upload `PUT` (no versions API) and uses the API field `new_tag` (≠ wrangler's `tag`); it's omitted entirely when there's nothing to create (an empty block can reset DO state). `nodejs_compat` is auto-injected for any DO deploy so the worker can't ship missing the Agents-SDK runtime flag. Safe for first-deploy + redeploy; additive evolution (`oldTag`/`new_tag` to add a class later) is plumbed but caller-driven.
- **`kvRateLimitStore`** — the production, KV-backed `RateLimitStore` for [`@suluk/hono`](../hono)'s `enforceRateLimit` (a fixed-window counter that fails *open* on a KV blip). Structurally typed, so it plugs straight in with no `@suluk/hono` dependency.

## When to reach for it

Reach for `@suluk/cloudflare` when you want to deploy a Suluk app (or any static/worker site) to Cloudflare **programmatically** — from a `deploy.ts` script or CI — rather than via the `wrangler` CLI. It is the executing adapter: it holds your token and actually calls the API.

- **vs [`@suluk/deploy`](../deploy)** — `@suluk/deploy` is *pure planning* behind a swappable provider interface; it computes the files + ordered steps to ship but never executes anything or touches credentials. `@suluk/cloudflare` is the concrete Cloudflare *doer*. Use `@suluk/deploy` when you want a provider-agnostic plan; use this when you're committing to Cloudflare and want it to run.

## Usage

### The one-call deploy

`deployWith` builds a client from your token/account and runs a full deploy. Pass it a `DeployPlan` of **bytes, not paths** — the disk-reading lives in your app script (see [Boundary](#boundary)).

```ts
import { deployWith, type AssetFile } from "@suluk/cloudflare";
import { readFileSync } from "node:fs";

const assets: AssetFile[] = [
  { path: "/index.html", bytes: new Uint8Array(readFileSync("dist/index.html")), contentType: "text/html" },
  // …walk your dist/ dir and map each file to { path, bytes, contentType }
];

const res = await deployWith(
  { apiToken: process.env.CLOUDFLARE_API_TOKEN!, accountId: process.env.CLOUDFLARE_ACCOUNT_ID },
  {
    scriptName: "saasuluk",
    module: readFileSync("worker/dist/worker.js", "utf8"), // the bundled ES module
    compatibilityDate: "2026-06-01",
    compatibilityFlags: ["nodejs_compat"],
    d1: { binding: "DB", databaseName: "saasuluk-db", migrations: [{ name: "0000_init.sql", sql: "CREATE TABLE t (id INTEGER);" }] },
    kv: [{ binding: "RATE_LIMIT_KV", title: "saasuluk-ratelimit" }],
    r2: [{ binding: "MEDIA", bucketName: "saasuluk-media" }],
    assets,
    assetsConfig: { html_handling: "auto-trailing-slash" },
    vars: { STRIPE_METER_EVENT_NAME: "saasuluk_cost" },     // plain-text bindings
    secrets: { BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET }, // encrypted; empty/undefined skipped
    crons: ["0 * * * *"],
    observability: true,
  },
  (msg) => console.log("  " + msg), // optional DeployLog — narrates each step
);

console.log(`Deployed "${res.scriptName}" to ${res.accountId} — D1 ${res.d1?.id}, ${res.assetsUploaded} assets, secrets: ${res.secretsSet.join(", ")}`);
```

The token must be Account-scoped: **Workers Scripts (Edit)**, **D1 (Edit)** (+ KV/R2 Edit if used), and **Account Settings (Read)**. Omit `accountId` and it resolves to the token's first account.

`deploy(cf, plan, log?)` is the same orchestration over an existing `CloudflareClient` if you already hold one.

### Driving the client / resources directly

Every step `deploy()` runs is also exported. Use them for one-off work the plan doesn't cover (e.g. seeding a DB after migrations, or attaching a route via raw `request`):

```ts
import { CloudflareClient, queryD1, provisionKvNamespace } from "@suluk/cloudflare";

const cf = new CloudflareClient({ apiToken: process.env.CLOUDFLARE_API_TOKEN! });

const db = await provisionKvNamespace(cf, "my-cache"); // create-or-get, idempotent
await queryD1(cf, databaseId, "INSERT OR REPLACE INTO setting (k, v) VALUES ('seeded', '1');");

// anything not in the plan yet (routes, custom domains, …) → the raw typed request:
await cf.request("PUT", `/accounts/${await cf.resolveAccountId()}/workers/scripts/saasuluk/routes`, {
  json: { pattern: "example.com/*", zone_name: "example.com" },
});
```

### KV-backed rate limiting (inside the Worker)

`kvRateLimitStore` is the production store for `@suluk/hono`'s `enforceRateLimit`. The KV binding isn't available at module init on Workers, so pass a **lazy getter**; it falls open to an in-memory fallback when KV is absent or errors.

```ts
import { kvRateLimitStore } from "@suluk/cloudflare";
import { enforceRateLimit } from "@suluk/hono";

let kv: KVNamespace | undefined;
const store = kvRateLimitStore(() => kv); // captures the binding on first request

app.use("*", async (c, next) => { if (!kv && c.env.RATE_LIMIT_KV) kv = c.env.RATE_LIMIT_KV; return next(); });
app.use("*", enforceRateLimit({ store, /* …operationOf, rateLimitOf, keyOf… */ }));
```

`memoryRateLimitStore()` is the dev-only / fail-open fallback — per-isolate, not coordinated across Workers instances.

## API

| Export | What it does |
| --- | --- |
| `deploy(cf, plan, log?)` / `deployWith(opts, plan, log?)` | the full orchestration over a `DeployPlan`; returns a `DeployResult` |
| `CloudflareClient` | typed REST client; `request(method, path, opts)` unwraps `result`, `resolveAccountId()` caches the account |
| `CloudflareError` | thrown on `success:false`/non-2xx, carrying `status` + the API's `errors[]` |
| `provisionD1` / `provisionKvNamespace` / `provisionR2Bucket` | idempotent create-or-get for D1 / KV / R2 |
| `applyMigrations` / `queryD1` | ledgered, run-once D1 migrations / raw D1 SQL |
| `putSecret` / `putSecrets` | encrypted Worker secrets (`putSecrets` skips empty values, returns the names set) |
| `uploadAssets` / `assetHash` / `extractAssetRuleFiles` | the Workers static-assets upload flow |
| `deployWorker` / `putCronTriggers` | upload a module worker (incl. DO bindings + inline `migrations`) / set its cron schedule |
| `DeployPlan.durableObjects` / `DurableObjectBinding` / `WorkerMigration` | bind + migrate SQLite-backed Durable Object agents (Cloudflare Agents SDK) |
| `kvRateLimitStore` / `memoryRateLimitStore` | KV-backed (prod) / in-memory (dev) `RateLimitStore` for `@suluk/hono` |

## Boundary

This package **executes** — it holds your token and calls Cloudflare. But it is pure over its inputs: `deploy()` takes a `DeployPlan` of **bytes, not paths** (the module source, the `AssetFile[]`, the migration SQL), so the whole library is unit-testable without disk or network. The **disk-reading wrapper is the app's seam** — walking `dist/`, reading the worker bundle and migration files lives in your `scripts/deploy.ts`, not in here (see saasuluk's `scripts/deploy.ts`). Inject the bytes; inject the `fetch`.

What stays out of the plan today: **routes / custom domains** aren't modeled — attach them via `CloudflareClient.request` (the typed escape hatch). If that pattern recurs, that's the candidate to fold into `DeployPlan`.

## License

Apache-2.0.
