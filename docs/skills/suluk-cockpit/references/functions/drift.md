# Functions

## drift

### `diffContracts`
Compare a LOCAL v4 contract against a DEPLOYED one and report the drift between them.
```ts
diffContracts(local: OpenAPIv4Document, deployed: OpenAPIv4Document): ContractDiff
```
**Parameters:**
- `local: OpenAPIv4Document`
- `deployed: OpenAPIv4Document`
**Returns:** `ContractDiff`

### `canonical`
Stable, key-order-independent JSON — reordering object keys is NOT drift. Cycle-safe (never overflows).
```ts
canonical(value: unknown): string
```
**Parameters:**
- `value: unknown`
**Returns:** `string`
