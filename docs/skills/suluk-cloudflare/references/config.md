# Configuration

## CloudflareClientOptions

`@suluk/cloudflare` — API-driven provisioning + deployment for a Suluk app on Cloudflare, no wrangler CLI. A typed
REST client, idempotent provisioners (D1 / KV / R2 / secrets), the Workers module-script + static-assets upload
flow, and a one-call `deploy()` that wires them in dependency order. The platform that ships itself, shipping
itself — readable, testable, and the same contract-first discipline as the rest of the suite. CANDIDATE tooling.

### Properties

#### apiToken

an API token (Bearer). Account-scoped: Workers Scripts + D1 (+ KV/R2) Edit, Account Settings Read.

**Type:** `string`

**Required:** yes

#### accountId

the account id; resolved from the token's first account when omitted.

**Type:** `string`

#### fetch

injected fetch (tests pass a recorder); defaults to the global.

**Type:** `typeof fetch`

#### baseUrl

API base (default the public Cloudflare API).

**Type:** `string`

## RequestOptions

`@suluk/cloudflare` — API-driven provisioning + deployment for a Suluk app on Cloudflare, no wrangler CLI. A typed
REST client, idempotent provisioners (D1 / KV / R2 / secrets), the Workers module-script + static-assets upload
flow, and a one-call `deploy()` that wires them in dependency order. The platform that ships itself, shipping
itself — readable, testable, and the same contract-first discipline as the rest of the suite. CANDIDATE tooling.

### Properties

#### json

a JSON body (sets content-type + serializes).

**Type:** `unknown`

#### body

a raw body (e.g. FormData / multipart) — takes precedence over `json`.

**Type:** `BodyInit`

#### headers

extra headers.

**Type:** `Record<string, string>`

#### query

query params.

**Type:** `Record<string, string | number | boolean | undefined>`

#### token

override the Bearer token (e.g. an assets-upload JWT).

**Type:** `string`

## DeployWorkerOptions

### Properties

#### name

**Type:** `string`

**Required:** yes

#### module

the bundled ES-module source.

**Type:** `string`

**Required:** yes

#### mainModule

the module filename referenced as `main_module` (default "worker.js").

**Type:** `string`

#### compatibilityDate

**Type:** `string`

**Required:** yes

#### compatibilityFlags

**Type:** `string[]`

#### bindings

typed bindings (d1, kv_namespace, r2_bucket, durable_object_namespace, …).

**Type:** `WorkerBinding[]`

#### migrations

Durable Object migrations — ride inline on THIS script upload (no separate call). Omit when there are none.

**Type:** `WorkerMigration[]`

#### vars

plain-text vars → `plain_text` bindings.

**Type:** `Record<string, string>`

#### assets

the static-assets completion JWT (from uploadAssets) + the binding name + assets config.

**Type:** `{ jwt: string | null; binding?: string; config?: Record<string, unknown> }`

#### observability

enable Workers observability (logs/traces).

**Type:** `boolean`

#### keepBindings

preserve bindings of these types from the prior version (default keeps secrets across deploys).

**Type:** `string[]`

## ConsumeOptions

A KV-backed RateLimitStore — the production durable counter @suluk/hono's `enforceRateLimit` needs (its
MemoryRateLimitStore is DEV-only; it doesn't coordinate across Workers isolates). Fixed-window counter in a
Workers KV namespace, fail-OPEN to a fallback store on any KV blip so a KV outage never hard-blocks traffic.

Structurally typed (no @suluk/hono dependency — the consume contract is tiny + stable), so the returned store
plugs straight into enforceRateLimit({ store }). The KV binding is resolved LAZILY (a getter) because on Workers
the binding isn't available at module-init — capture it on first request.

### Properties

#### maxRequests

**Type:** `number`

**Required:** yes

#### windowMs

**Type:** `number`

**Required:** yes

#### now

**Type:** `number`

**Required:** yes