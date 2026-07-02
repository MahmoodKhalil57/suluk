# Functions

## providers

### `providerFacets`
The facets the catalog knows about (payments, auth, email, storage).
```ts
providerFacets(): string[]
```
**Returns:** `string[]`

### `readProviders`
The active provider bindings recorded in the document (from installed modules' providerSlots).
```ts
readProviders(doc: unknown): ProviderBinding[]
```
**Parameters:**
- `doc: unknown`
**Returns:** `ProviderBinding[]`

### `swapProvider`
Rebind a facet's slot to another implementation of the same interface. Returns the unchanged doc on error.
```ts
swapProvider<T>(doc: T, facet: string, impl: string): SwapResult<T>
```
**Parameters:**
- `doc: T`
- `facet: string`
- `impl: string`
**Returns:** `SwapResult<T>`
