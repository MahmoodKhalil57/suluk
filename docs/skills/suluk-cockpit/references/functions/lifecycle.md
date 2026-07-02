# Functions

## lifecycle

### `contractGates`
The CONTRACT-level ship gates — everything decidable from the document itself (no host needed).
```ts
contractGates(doc: OpenAPIv4Document, baseline: Baseline): Gate[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `baseline: Baseline`
**Returns:** `Gate[]`

### `shipSummary`
A one-line readiness summary over a set of gates (contract + host). "info" gates never count against ready.
```ts
shipSummary(gates: Gate[]): { ready: boolean; line: string }
```
**Parameters:**
- `gates: Gate[]`
**Returns:** `{ ready: boolean; line: string }`
