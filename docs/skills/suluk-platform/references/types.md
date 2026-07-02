# Types & Enums

## manifest

### `PlatformManifest`
The C051 legacy manifest — still valid, still the byte-identity anchor.
**Properties:**
- `name: string` — the app/repo name (used in the generated scaffold).
- `registry: string` — the shadcn registry, e.g. "MahmoodKhalil57/suluk".
- `services: string[]` — the services to include, in mount order — resolved against the catalog. `app` + `auth` are implied if any is listed.
- `opts: Record<string, Record<string, unknown>>` (optional) — per-service static OPTIONS passed to that service's mount in the generated entry (JSON-serializable).
- `vars: Record<string, string>` (optional) — NON-SECRET config values → generated into `wrangler.toml` `[vars]`. SECRETS never go here (they live in `.env`).
- `localVars: Record<string, string>` (optional) — C058 (INTERNAL, dev-only) — the LOCAL-runtime derived URL vars (BASE_URL/BETTER_AUTH_URL/TRUSTED_ORIGINS/EMAIL_FROM),
 computed by `deriveHosts` from `LOCAL_BASE_URL`. Spread into `src/dev.ts`'s env; NEVER emitted to `[vars]`.
- `__localHost: string` (optional) — C058 (INTERNAL, dev-only) — the raw local host (e.g. `localhost:8787`), so `src/dev.ts` can re-splice the actual PORT.
- `local: boolean` (optional) — emit the MOCK-PROVIDER dev runtime: a `src/dev.ts` that runs the app under bun with a bun:sqlite DB + JSON-file KV +
 mocked providers when their keys are absent (mock-until-keyed), and the `dev` script pointed at it. Default false →
 the scaffold is byte-for-byte the C051 golden.

### `SystemManifest`
A SYSTEM — the reusable, publishable template. Generic over the services tuple so `serviceOpts` is typed by service id.
**Properties:**
- `registry: string` (optional) — the single core registry, e.g. "MahmoodKhalil57/suluk". (Multi-registry alias map: `registries`, Phase 4.)
- `registries: Record<string, string>` (optional) — alias → registry map for multi-registry systems (Phase 4). `registries.core` is the default when `registry` is unset.
- `services: T` — the services, in mount order — imported Service objects (typed) and/or string ids.
- `globalServiceOpts: Record<string, unknown>` (optional) — system-wide behaviour shared by services; a service receives the keys it names in `reads.globalService` (else inert).
- `serviceOpts: Partial<{ [K in ServiceRef as IdOf<K>]: SoOf<K> }>` (optional) — per-service serviceOpts — TYPED by service id off the imported service objects.
- `wire: WireDecl[]` (optional) — inter-service composition edges (Phase 3).
- `local: boolean` (optional) — emit the MOCK-PROVIDER dev runtime (a `src/dev.ts` bun server with a bun:sqlite DB + JSON KV + mocked providers when
 keys are absent). A SYSTEM-level property (the app structure), swappable per brand only if a brand overrides it.

### `BrandManifest`
A BRAND — thin, swappable per deployment. Carries the app identity + the brand-facing opts (→ `[vars]`).
**Properties:**
- `name: string` — the deployment/app name (the wrangler + package name). Differs per brand of the same system.
- `globalBrandOpts: Record<string, unknown>` (optional) — brand identity shared by every service (BRAND_NAME, baseUrl, emailFrom, …) → `[vars]`.
- `brandOpts: Record<string, Record<string, unknown>>` (optional) — per-service brand-facing opts → `[vars]`.
- `wireBrandOpts: Record<string, Record<string, unknown>>` (optional) — brand-tunable EDGE params keyed by `wire.id` (Phase 3).

### `Platform`
A bound platform = a system + a brand.
**Properties:**
- `system: SystemManifest<any>`
- `brand: BrandManifest`

### `ServiceRef`
A reference to a service: an imported Service object (fully typed) or a bare string id (resolved against the
 catalog; opts typed as `unknown`).
```ts
string | Service<any, any>
```

### `WireDecl`
An inter-service composition EDGE (Phase 3). Declared here so a Phase-2 manifest's shape is forward-compatible; the
resolver ignores `wire` until the Phase-3 engine lands. `from`/`to` are `"<service>.<port|capability>"`.
**Properties:**
- `id: string` (optional)
- `from: string`
- `to: string`
- `with: Record<string, unknown>` (optional)
- `optional: boolean` (optional) — PRUNE this edge (skip + warn) instead of throwing when an endpoint service isn't selected — so ONE full config is
 valid across every subset. A cross-cutting/optional link (erasure fan-in, contract↔auth) should set this.

## wire

### `Wiring`
**Properties:**
- `hooksByService: Record<string, Record<string, string>>` — producer service id → { hookOptKey → rendered closure } — injected into that service's mount opts by `buildEntry`.
- `imports: WireImport[]` — the imports every consumed capability needs, de-duped (in first-seen order).
- `pruned: string[]` — OPTIONAL edges skipped because an endpoint service wasn't selected — so ONE full config is valid across subsets.

### `WireImport`
**Properties:**
- `symbol: string`
- `from: string`

## service

### `Service`
THE COMMON INTERFACE. `SO` = the service-opts value type, `BO` = the brand-opts value type (both Phase 2). A core service
and a community service instantiate the exact same shape via defineService.
**Properties:**
- `id: string`
- `registry: string` (optional)
- `mount: Mount`
- `provision: { symbol: string; from: string }` (optional)
- `contract: { symbol: string; from: string }` (optional) — the module's CONTRACT fragment — its `RouteContract[]` (ops), composed into `src/contract.ops.ts` (mirrors `provision`).
- `deps: string[]` (optional)
- `requires: string[]` (optional) — MOUNT peers this module needs at RUNTIME (distinct from npm `deps`): e.g. a route that reads `c.get("user")`/scopes
 set by `mountAuthRoutes` declares `requires: ["auth"]`. The generator ERRORS if a selected service's requires aren't
 also selected — turning a silently-unauthenticated subset into a build failure, without force-adding auth everywhere.
- `env: EnvVar[]` (optional)
- `serviceOpts: Schema<SO>` (optional)
- `brandOpts: Schema<BO>` (optional)
- `reads: { globalService?: string[]; globalBrand?: string[] }` (optional)
- `compose: CompositionSurface` (optional)

### `Port`
A typed PORT a service EXPOSES: a named hook others fill. `hookOptKey` is the mount-opt field a bound edge renders INTO
(e.g. auth's `onUserCreated`), so an edge never emits a separate post-route statement — it composes into the producer's
own mount call. `render` wraps the consumer expressions for this hook's real signature. (Consumed in Phase 3.)
**Properties:**
- `kind: "port"`
- `param: Schema<P>` (optional)
- `hookOptKey: string`
- `render: (consumerExprs: string[]) => string`
- `fanIn: boolean` (optional) — documents a FAN-IN port (several capabilities aggregate into one hook, e.g. erasure's cascade). No engine branch —
 fan-in already works (the engine groups by port-owner + `render` takes the full `string[]`); this marks intent.

### `Capability`
A typed CAPABILITY a service OFFERS to fill a port. `build` produces the consumer EXPRESSION rendered into the producer's
hook closure — it may reference the closure's fixed params `userId` and `env` (the seam threads env), plus the symbols it
declares in `imports` (all TRUSTED — from the service definition, never manifest free text). `with` is the wire's
schema-validated params (JSON data only). (Consumed in Phase 3.)
**Properties:**
- `kind: "capability"`
- `param: Schema<A>` (optional)
- `symbol: string`
- `from: string`
- `imports: { symbol: string; from: string }[]` (optional)
- `build: (ctx: { with: Record<string, unknown> }) => string`

### `CompositionSurface`
What a service brings to the composition graph: the ports it exposes + the capabilities it offers.
**Properties:**
- `exposes: Record<string, Port<unknown>>` (optional)
- `offers: Record<string, Capability<unknown>>` (optional)

### `Schema`
Standard-Schema v1 shape (zod v4 implements it). Declared LOCALLY so the Service interface can carry the typed-opts slots
with NO runtime validator dependency in Phase 1; Phase 2 replaces this with `@standard-schema/spec` and populates
`serviceOpts`/`brandOpts` with real zod schemas (zod as a peerDependency). `Out` carries the inferred value type.
**Properties:**
- `~standard: { version: 1; vendor: string; validate: (value: unknown) => { value: Out } | { issues: readonly unknown[] } | Promise<unknown> }`

### `McpOAuthOpts`
The MCP OAuth authorization-server config (auth's `serviceOpts.mcp`) — the frontend OAuth pages + resource + scope set.
**Properties:**
- `loginPage: string`
- `consentPage: string`
- `resource: string`
- `scopes: string[]`

### `AuthServiceOpts`
auth's serviceOpts: optionally activate the MCP OAuth server (Better Auth `mcp()` plugin).
**Properties:**
- `mcpScopes: string[]` (optional) — C058: activate the MCP OAuth server by declaring its SCOPE SET — the loginPage/consentPage/resource URLs are DERIVED
 from `LIVE_BASE_URL` (no host boilerplate). This is the single-source authoring path.
- `mcp: McpOAuthOpts` (optional) — LEGACY: the full MCP OAuth URL block. Prefer `mcpScopes` (URLs derived). Kept for back-compat with hand-authored URLs.

### `CatalogEntry`
The old catalog record — now a DERIVED VIEW of a Service (see toCatalogEntry); kept so `planPlatform`
 and the C051 helpers read the same shape they always did.
**Properties:**
- `mount: Mount`
- `provision: { symbol: string; from: string }` (optional)
- `contract: { symbol: string; from: string }` (optional) — the module's CONTRACT fragment — its `RouteContract[]` (ops), composed into `src/contract.ops.ts` (mirrors `provision`).
- `deps: string[]` (optional)
- `env: EnvVar[]` (optional)

### `Mount`
How a module contributes to the generated `src/index.ts`. (Unchanged from C051.)
```ts
{ kind: "base" } | { kind: "middleware"; symbol: string; from: string } | { kind: "route"; path: string; symbol: string; from: string } | { kind: "dev" }
```

### `EnvVar`
An env var a module (or the app's provisioning) needs — drives the generated `env.ts`, `.env.example`, `.env.temp`, the
 env-check preflight, and the provision/sync-secrets scripts.
**Properties:**
- `name: string`
- `required: boolean` (optional) — the app WON'T work without it (the "minimum keys") — the env-check requires a non-empty value before it's happy.
- `secret: boolean` (optional) — a credential (encrypted at rest in the committed `.env`, or — if `provisioning` — staged plaintext in `.env.temp`).
- `hint: string` (optional) — a one-line hint shown as a comment.
- `surface: "local" | "cloudflare"` (optional) — Where the value is USED. `"cloudflare"` = a Worker RUNTIME secret (pushed by `sync-secrets` / decrypted by `loadEnv`);
`"local"` = used only by provisioning/deploy on this machine, NEVER shipped to the Worker. Defaults: a `secret` → the
Worker runtime (`"cloudflare"`); a `provisioning`/`minted` cred → `"local"`.
- `provisioning: boolean` (optional) — An EPHEMERAL provisioning credential (e.g. the Cloudflare API master token): supplied PLAINTEXT in `.env.temp`, used to
provision infra + mint scoped tokens, then DELETED after provisioning — never committed (not even encrypted). Implies
`surface: "local"`.
- `minted: boolean` (optional) — a scoped least-privilege token MINTED during provisioning (from the master), then kept ENCRYPTED in `.env`. `surface: "local"`.
- `generated: boolean` (optional) — a random secret the provisioning flow AUTO-GENERATES (e.g. `BETTER_AUTH_SECRET` ← 32 random bytes) if not already set —
 so the operator never supplies it in `.env.temp`; it still lands ENCRYPTED in the committed `.env`.

## plan

### `PlatformPlan`
**Properties:**
- `services: string[]`
- `adds: string[]` — shadcn refs to add, in order (e.g. "MahmoodKhalil57/suluk/credits").
- `entry: string` — the generated `src/index.ts` content.
- `provisionConfig: string` — the generated `provision.config.ts` content.
- `contractOps: string` (optional) — the generated `src/contract.ops.ts` — the COMPOSED contract surface (one `RouteContract[]` fragment per module). Present
 ONLY when the `contract` service is installed; the base `src/contract.ts` consumes its `ALL_OPS`.
- `packageJson: string` — the generated `package.json` content (the FRAMEWORK baseline — `generate` merges it with any existing so app-added
 deps/scripts survive). @suluk/* on "latest" so fixes flow via `bun update`; ecosystem deps on pinned ranges.
- `tsconfig: string` — the generated `tsconfig.json` content (the Workers + TS config; test files excluded from the build).
- `componentsJson: string` — the generated `components.json` content (so `shadcn add` resolves the file targets).
- `envExample: string` — the generated `.env.example` — the SECRET keys the selected services need (non-secrets live in the manifest `vars`).
- `wranglerToml: string` — the generated `wrangler.toml` — `[vars]` from the manifest's non-secret config + the D1/KV binding placeholders.
- `gitignore: string` — the generated `.gitignore` — ignores `.env.keys` (the private key) + `.env.temp`, but NOT `.env` (committed ENCRYPTED).
- `envCheck: string` — the generated `scripts/env-check.ts` — the encrypted-env preflight (keypair present? required secrets set + encrypted?).
- `envTs: string` — the generated `src/env.ts` — the @suluk/env `defineEnv` declaration (declare-once: the app's secrets, surfaced).
- `syncSecrets: string` — the generated `scripts/sync-secrets.ts` — decrypt the cloudflare-surfaced secrets from the committed .env and push them
 as `wrangler secret`s (the toolfactory-exact deploy path; the alternative is the entry's runtime `loadEnv`).
- `linkKey: string` — the generated `scripts/link-key.ts` — register the private key into the centralized `~/.suluk/settings.json` (the store
 `@suluk/env` reads by default for local dev/deploy/CI), the toolfactory model.
- `envTemp: string` — the generated `.env.temp` SCAFFOLD — the PLAINTEXT bootstrap for `bun run provision` (gitignored; consumed + deleted).
- `provisionScript: string` — the generated `scripts/provision.ts` — the credential lifecycle: source `.env.temp`/`.env` → provision → mint scoped
 tokens → encrypt keepers → DELETE the ephemeral master token → stage the encrypted `.env`.
- `mintTokens: string` — the generated `scripts/mint-tokens.ts` — mint scoped least-privilege CF tokens from the master, encrypted into `.env`.
- `envScaffold: string` — the generated `.env` SCAFFOLD (committed) — a header + the setup steps, NO values. `generate` writes it only if absent
 (never clobbering the operator's encrypted secrets). Secret VALUES are added encrypted via `suluk-env set`.
- `devEntry: string` (optional) — the generated `src/dev.ts` — the bun MOCK-PROVIDER dev server (bun:sqlite DB + JSON KV + mocked providers when keys
 absent). Present ONLY when the manifest sets `local: true`; undefined otherwise (so the golden path is unchanged).
- `purgeScript: string` (optional) — the generated `scripts/purge-state.ts` — clears dev/live state (recommended on a mock↔real swap or a provision
 migration). Present ONLY when `local: true`.

## generate

### `GenerateResult`
**Properties:**
- `plan: PlatformPlan`
- `added: string[]`
- `written: string[]`
