[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cost](../README.md) / CostMeterOptions

# Interface: CostMeterOptions

Defined in: [meter.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cost/src/meter.ts#L31)

## Properties

### actionHeader?

> `optional` **actionHeader?**: `string`

Defined in: [meter.ts:40](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cost/src/meter.ts#L40)

Header carrying the frontend action id (default "x-suluk-action").

***

### costs

> **costs**: `Record`\<`string`, [`CostModel`](CostModel.md)\>

Defined in: [meter.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cost/src/meter.ts#L34)

operation name → its declared cost model.

***

### now?

> `optional` **now?**: () => `number`

Defined in: [meter.ts:42](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cost/src/meter.ts#L42)

Wall-clock now (ms). Pass `() => Date.now()` in production; a fixed fn in tests for reproducibility.

#### Returns

`number`

***

### operationOf

> **operationOf**: (`c`) => `string` \| `undefined`

Defined in: [meter.ts:36](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cost/src/meter.ts#L36)

Resolve the operation name for a request (e.g. c.get("operation"), or a matcher).

#### Parameters

##### c

`Context`

#### Returns

`string` \| `undefined`

***

### principalOf?

> `optional` **principalOf?**: (`c`) => `string` \| `undefined`

Defined in: [meter.ts:38](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cost/src/meter.ts#L38)

Resolve the principal/user id (default: none).

#### Parameters

##### c

`Context`

#### Returns

`string` \| `undefined`

***

### sink

> **sink**: [`CostSink`](CostSink.md)

Defined in: [meter.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/cost/src/meter.ts#L32)
