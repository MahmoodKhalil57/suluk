[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cost](../README.md) / MemoryCostSink

# Class: MemoryCostSink

Defined in: [meter.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/cost/src/meter.ts#L15)

A simple in-memory sink (for the demo / tests). Production swaps in D1, a queue, etc.

## Implements

- [`CostSink`](../interfaces/CostSink.md)

## Constructors

### Constructor

> **new MemoryCostSink**(): `MemoryCostSink`

#### Returns

`MemoryCostSink`

## Methods

### clear()

> **clear**(): `void`

Defined in: [meter.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/cost/src/meter.ts#L19)

#### Returns

`void`

***

### events()

> **events**(): [`CostEvent`](../interfaces/CostEvent.md)[]

Defined in: [meter.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/cost/src/meter.ts#L18)

#### Returns

[`CostEvent`](../interfaces/CostEvent.md)[]

***

### record()

> **record**(`e`): `void`

Defined in: [meter.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/cost/src/meter.ts#L17)

#### Parameters

##### e

[`CostEvent`](../interfaces/CostEvent.md)

#### Returns

`void`

#### Implementation of

[`CostSink`](../interfaces/CostSink.md).[`record`](../interfaces/CostSink.md#record)
