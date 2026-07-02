# Functions

## select

### `selectModel`
```ts
selectModel(reqs: HardFilters, prefs: Preferences, catalog: ModelCatalog): SelectResult
```
**Parameters:**
- `reqs: HardFilters`
- `prefs: Preferences`
- `catalog: ModelCatalog`
**Returns:** `SelectResult`

### `deriveRequirements`
Derive HardFilters from an agent/skill's declared needs + the analyzer's load (the C027 seam).
```ts
deriveRequirements(input: { minWindowRequired?: number; hasRoutes?: boolean; needsStructured?: boolean; inputModalities?: string[]; policy?: { modelAllowlist?: string[]; allowedRegions?: string[]; allowedLicenses?: string[]; allowedRetention?: DataRetention[] } }): HardFilters
```
**Parameters:**
- `input: { minWindowRequired?: number; hasRoutes?: boolean; needsStructured?: boolean; inputModalities?: string[]; policy?: { modelAllowlist?: string[]; allowedRegions?: string[]; allowedLicenses?: string[]; allowedRetention?: DataRetention[] } }`
**Returns:** `HardFilters`

## bucketing

### `applyBucketing`
Bucket a raw leaderboard score into a coarse tier per the committed rule. Null/absent/unknown-axis ⇒ `unknown`.
```ts
applyBucketing(axis: string, score: number | null | undefined): Tier
```
**Parameters:**
- `axis: string`
- `score: number | null | undefined`
**Returns:** `Tier`

## normalize

### `normalizeOpenRouter`
```ts
normalizeOpenRouter(models: ORModel[], asOf: string): ModelRecord[]
```
**Parameters:**
- `models: ORModel[]`
- `asOf: string`
**Returns:** `ModelRecord[]`

### `normalizeOpenRouterModel`
One OpenRouter model → its decidable fact cells (intel/gov tiers stay UNKNOWN; filled by the Class-B pass).
```ts
normalizeOpenRouterModel(m: ORModel, asOf: string): ModelRecord
```
**Parameters:**
- `m: ORModel`
- `asOf: string`
**Returns:** `ModelRecord`

### `catalogFrom`
```ts
catalogFrom(rows: ModelRecord[], asOf: string): ModelCatalog
```
**Parameters:**
- `rows: ModelRecord[]`
- `asOf: string`
**Returns:** `ModelCatalog`

### `snapshotHash`
A content-addressed hash over the rows' load-bearing SELECTION inputs — facts AND intel tiers (a re-pick under a
different catalog must differ; reproducible pin; ties C027 contentHash).
```ts
snapshotHash(rows: ModelRecord[]): string
```
**Parameters:**
- `rows: ModelRecord[]`
**Returns:** `string`

## fetch

### `fetchOpenRouterCatalog`
Fetch OpenRouter `/models` and normalize to the fact-cell catalog. NETWORK — run from a weekly script/CI, not tests.
```ts
fetchOpenRouterCatalog(asOf: string, opts: { baseUrl?: string; fetchImpl?: typeof fetch }): Promise<ModelCatalog>
```
**Parameters:**
- `asOf: string`
- `opts: { baseUrl?: string; fetchImpl?: typeof fetch }` — default: `{}`
**Returns:** `Promise<ModelCatalog>`

## overlay

### `applyTierOverlay`
Overlay coarse tiers onto matching rows' intel cells, then re-hash (selection now depends on these tiers).
```ts
applyTierOverlay(catalog: ModelCatalog, tiers: Record<string, Partial<Record<IntelAxis, Tier>>>, opts: { source: string; asOf: string }): ModelCatalog
```
**Parameters:**
- `catalog: ModelCatalog`
- `tiers: Record<string, Partial<Record<IntelAxis, Tier>>>`
- `opts: { source: string; asOf: string }`
**Returns:** `ModelCatalog`
