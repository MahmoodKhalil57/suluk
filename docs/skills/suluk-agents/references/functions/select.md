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
