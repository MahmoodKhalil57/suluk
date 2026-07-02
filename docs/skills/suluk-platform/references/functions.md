# Functions

## manifest

### `definePlatform`
Validate + return a platform. Accepts BOTH the legacy PlatformManifest and the C053 `{ system, brand }` shape
(discriminated on the `system` key). Overloaded so the return type matches the input surface.
```ts
definePlatform(input: PlatformManifest): PlatformManifest
```
**Parameters:**
- `input: PlatformManifest`
**Returns:** `PlatformManifest`
**Overloads:**
```ts
definePlatform(input: Platform): Platform
```

### `defineSystem`
Author a SYSTEM. `const T` captures the services tuple so `serviceOpts` types resolve per service id.
```ts
defineSystem<T>(s: SystemManifest<T>): SystemManifest<T>
```
**Parameters:**
- `s: SystemManifest<T>`
**Returns:** `SystemManifest<T>`

### `defineBrand`
Author a BRAND.
```ts
defineBrand(b: BrandManifest): BrandManifest
```
**Parameters:**
- `b: BrandManifest`
**Returns:** `BrandManifest`

### `isPlatform`
Discriminate the C053 `{ system, brand }` shape from the legacy manifest.
```ts
isPlatform(input: PlatformManifest | Platform): input is Platform
```
**Parameters:**
- `input: PlatformManifest | Platform`
**Returns:** `input is Platform`

## resolve

### `resolveNodeOpts`
Resolve the node quadrants of `{ system, brand }` into the `{ services, opts, vars }` a legacy manifest carries:
 - `opts[id]` (→ entry): the globalServiceOpts keys the service `reads`, deep-merged UNDER its per-service serviceOpts.
   Empty results are omitted, so the map matches a hand-written legacy manifest (which only lists services that HAVE opts).
 - `vars` (→ [vars]): every scalar value across globalServiceOpts + globalBrandOpts + per-service brandOpts. `buildWrangler`
   only surfaces the ones that are declared service env vars, so extra keys are harmless.
```ts
resolveNodeOpts(system: SystemManifest, brand: BrandManifest): { services: string[]; opts: Record<string, Record<string, unknown>>; vars: Record<string, string> }
```
**Parameters:**
- `system: SystemManifest`
- `brand: BrandManifest`
**Returns:** `{ services: string[]; opts: Record<string, Record<string, unknown>>; vars: Record<string, string> }`

### `liftSystemBrand`
Lower a `{ system, brand }` platform to the legacy PlatformManifest the C051 generator renders.
```ts
liftSystemBrand(p: Platform): PlatformManifest
```
**Parameters:**
- `p: Platform`
**Returns:** `PlatformManifest`

### `liftLegacy`
The MIGRATE direction — a legacy PlatformManifest → the C053 `{ system, brand }` split (the inverse of
liftSystemBrand). `opts` → per-service serviceOpts; `vars` split into globalServiceOpts (system-shaped) vs
globalBrandOpts (identity). Round-trips byte-for-byte: `liftSystemBrand(liftLegacy(m))` generates the same app as `m`.
```ts
liftLegacy(m: PlatformManifest): Platform
```
**Parameters:**
- `m: PlatformManifest`
**Returns:** `Platform`

### `serviceId`
A ServiceRef → its runtime id (a string ref is the id; a Service object contributes `.id`).
```ts
serviceId(ref: string | { id: string }): string
```
**Parameters:**
- `ref: string | { id: string }`
**Returns:** `string`

## wire

### `resolveWiring`
Validate + compile the wires into per-producer hook fields + the imports they need.
```ts
resolveWiring(services: string[], wires: WireDecl[], catalog: Record<string, Service>): Wiring
```
**Parameters:**
- `services: string[]`
- `wires: WireDecl[]`
- `catalog: Record<string, Service>`
**Returns:** `Wiring`

### `groupImports`
Group wire imports by module specifier → one `import { a, b } from "x";` per module (first-seen order).
```ts
groupImports(imps: WireImport[]): string[]
```
**Parameters:**
- `imps: WireImport[]`
**Returns:** `string[]`

### `assertJsonSafe`
Reject non-JSON data (functions/symbols/bigint/undefined) + prototype-pollution keys anywhere in a wire's params.
```ts
assertJsonSafe(v: unknown, path: string): void
```
**Parameters:**
- `v: unknown`
- `path: string` — default: `"with"`

### `validateIdentifier`
Guard a code IDENTIFIER (a capability symbol / import symbol) — fail closed on anything that isn't a plain identifier.
```ts
validateIdentifier(s: string, what: string): void
```
**Parameters:**
- `s: string`
- `what: string`

### `lit`
A schema-validated value → an inert JSON literal (never an identifier or call).
```ts
lit(v: unknown): string
```
**Parameters:**
- `v: unknown`
**Returns:** `string`

## service

### `defineService`
Author a service. `const S` PRESERVES the literal `id` + the precise `serviceOpts`/`brandOpts` marker types, so the
manifest (`defineSystem`) can key typed opts by service id off the imported service objects — no codegen. Validates the id.
```ts
defineService<S>(s: S): S
```
**Parameters:**
- `s: S`
**Returns:** `S`

### `optsType`
A TYPED opts marker for a service's `serviceOpts`/`brandOpts`. Phase 2 uses it purely for TYPES — the manifest author
gets autocomplete + type-checking on that service's opts. It carries the value type `T` in the `Schema<T>` slot; Phase 3
swaps it for a runtime-validating zod schema of the SAME type (a drop-in — the field type is `Schema<T>` either way).
```ts
optsType<T>(): Schema<T>
```
**Returns:** `Schema<T>`

### `toCatalogEntry`
Project a Service onto the legacy CatalogEntry shape the C051 generator reads. Field-for-field — so a derived
 CATALOG is behaviourally identical to the old hardcoded one (proven by the Phase-0 golden lock).
```ts
toCatalogEntry(s: Service): CatalogEntry
```
**Parameters:**
- `s: Service`
**Returns:** `CatalogEntry`

## catalog

### `orderServices`
app + auth always come first (the base + the user/apikey tables others reference); the rest keep manifest order.
```ts
orderServices(services: string[]): string[]
```
**Parameters:**
- `services: string[]`
**Returns:** `string[]`

### `collectEnv`
The env vars the selected services need, de-duped by name (first declaration wins). Split with `.secret` into the
 `.env` secrets (the .env.temp lifecycle) vs the non-secret CONFIG (defined in platform.config.ts `vars` → wrangler `[vars]`).
```ts
collectEnv(services: string[], catalog: Record<string, { env?: EnvVar[] }>): EnvVar[]
```
**Parameters:**
- `services: string[]`
- `catalog: Record<string, { env?: EnvVar[] }>` — default: `CATALOG`
**Returns:** `EnvVar[]`

### `resolveVersion`
Resolve a dep to its version: an @suluk/* package → "latest" (fixes flow via `bun update`); a known ecosystem dep →
 its pinned range; anything else → "latest" (a best-effort default).
```ts
resolveVersion(dep: string): string
```
**Parameters:**
- `dep: string`
**Returns:** `string`

## merge

### `mergeProvision`
```ts
mergeProvision(fragments: InstanceSpec[][]): InstanceSpec[]
```
**Parameters:**
- `fragments: InstanceSpec[][]`
**Returns:** `InstanceSpec[]`

## plan

### `planPlatform`
```ts
planPlatform(input: PlatformManifest | Platform): PlatformPlan
```
**Parameters:**
- `input: PlatformManifest | Platform`
**Returns:** `PlatformPlan`

### `buildPackageJson`
The framework baseline package.json — name from the manifest, the union of BASE + each service's deps (versions
 resolved: @suluk/* → "latest", ecosystem → pinned), + the toolchain devDeps + the regenerate/typecheck scripts.
```ts
buildPackageJson(name: string, services: string[], catalog: Record<string, Service>, local: boolean): string
```
**Parameters:**
- `name: string`
- `services: string[]`
- `catalog: Record<string, Service>` — default: `CORE_SERVICES`
- `local: boolean` — default: `false`
**Returns:** `string`

### `mergePackageJson`
Merge the generated framework baseline package.json with the app's EXISTING one (if any). The baseline WINS for the
framework + module deps (so `@suluk/*` stay `"latest"` and the ecosystem stays on its pinned range — deps stay current
across a regenerate), while any deps / scripts / top-level fields the app added are PRESERVED. No existing ⇒ the baseline
verbatim. Keys are sorted for stable output. Pure + testable.
```ts
mergePackageJson(baselineJson: string, existingJson: string | null): string
```
**Parameters:**
- `baselineJson: string`
- `existingJson: string | null`
**Returns:** `string`

### `mergeWranglerToml`
Preserve the operator's provisioned binding ids (keyed by `binding = "NAME"`) across a wrangler.toml regenerate.
```ts
mergeWranglerToml(generated: string, existing: string | null): string
```
**Parameters:**
- `generated: string`
- `existing: string | null`
**Returns:** `string`

### `mergeGitignore`
Merge the generated .gitignore into an existing one — APPEND any missing entries (never skip-if-present, so an app's
 minimal .gitignore can't leave `.env.keys`/`.env.temp` UNIGNORED and risk committing the private key). Dedup, preserve app
 entries. ENCRYPTED-ENV TRANSITION: if the new baseline ignores `.env.keys` (the private key) but NOT `.env`, a plaintext-era
 `.env` ignore is REMOVED — the .env is now COMMITTED with its values encrypted, so ignoring it is wrong (and safe to undo).
```ts
mergeGitignore(generated: string, existing: string | null): string
```
**Parameters:**
- `generated: string`
- `existing: string | null`
**Returns:** `string`

## generate

### `generatePlatform`
```ts
generatePlatform(input: PlatformManifest | Platform, opts: GenerateOptions): Promise<GenerateResult>
```
**Parameters:**
- `input: PlatformManifest | Platform`
- `opts: GenerateOptions`
**Returns:** `Promise<GenerateResult>`
