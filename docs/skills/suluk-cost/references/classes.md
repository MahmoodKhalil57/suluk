# Classes

## meter

### `MemoryCostSink`
A simple in-memory sink (for the demo / tests). Production swaps in D1, a queue, etc.
*implements `CostSink`*
```ts
constructor(): MemoryCostSink
```
**Methods:**
- `record(e: CostEvent): void`
- `events(): CostEvent[]`
- `clear(): void`
