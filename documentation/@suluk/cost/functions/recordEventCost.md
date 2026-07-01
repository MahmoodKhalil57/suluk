[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cost](../README.md) / recordEventCost

# Function: recordEventCost()

> **recordEventCost**(`sink`, `input`, `seen?`): `Promise`\<[`CostEvent`](../interfaces/CostEvent.md) \| `null`\>

Defined in: [event.ts:104](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/cost/src/event.ts#L104)

Record a fired event's cost into a sink, deduped by its `dedupeKey` against `seen` (so at-least-once delivery
can't double-charge). Returns the recorded event, or null when it was a duplicate. `seen` is the app's dedup
store (an in-memory Set for dev; a durable KV/DO for prod).

## Parameters

### sink

[`CostSink`](../interfaces/CostSink.md)

### input

[`EventCostInput`](../interfaces/EventCostInput.md)

### seen?

`Set`\<`string`\>

## Returns

`Promise`\<[`CostEvent`](../interfaces/CostEvent.md) \| `null`\>
