# Functions

## analyze

### `analyzeComposition`
Collect every violation, then apply each metric's budget (report only the occurrences BEYOND the budget).
```ts
analyzeComposition(source: string, options: CompositionOptions): Violation[]
```
**Parameters:**
- `source: string`
- `options: CompositionOptions` — default: `{}`
**Returns:** `Violation[]`
