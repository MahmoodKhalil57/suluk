# Functions

## visual

### `componentReport`
Decompose a contract's generated components into primitives and check their pixel-confidence vs a baseline.
```ts
componentReport(doc: OpenAPIv4Document, baseline: Baseline): ComponentReport
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `baseline: Baseline`
**Returns:** `ComponentReport`

### `approveComponents`
The "verify once": approve every used primitive at its current content hash, returning the new baseline.
```ts
approveComponents(report: ComponentReport, baseline: Baseline, at: number): Baseline
```
**Parameters:**
- `report: ComponentReport`
- `baseline: Baseline`
- `at: number`
**Returns:** `Baseline`
