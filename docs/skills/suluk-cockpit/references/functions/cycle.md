# Functions

## cycle

### `buildCycle`
Build the full cycle model from a v4 document, optionally projected for a principal (the "who").
```ts
buildCycle(doc: OpenAPIv4Document, opts: { principal?: Principal }): CycleModel
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `opts: { principal?: Principal }` — default: `{}`
**Returns:** `CycleModel`

### `docChecks`
Doc-level "contract checks" — the mistakes a finished v4 document can still encode.
```ts
docChecks(doc: OpenAPIv4Document): DocCheck[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `DocCheck[]`

### `cycleSummary`
A flat list for simple renderers / status lines.
```ts
cycleSummary(model: CycleModel): { layer: string; summary: string; status: LayerStatus }[]
```
**Parameters:**
- `model: CycleModel`
**Returns:** `{ layer: string; summary: string; status: LayerStatus }[]`
