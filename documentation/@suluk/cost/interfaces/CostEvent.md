[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cost](../README.md) / CostEvent

# Interface: CostEvent

Defined in: [types.ts:118](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/cost/src/types.ts#L118)

What a single request actually cost — the rawest record, attributed all the way down.

## Properties

### action?

> `optional` **action?**: `string`

Defined in: [types.ts:126](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/cost/src/types.ts#L126)

The frontend action that triggered it (a button-click id), if the client tagged the request.

***

### at

> **at**: `number`

Defined in: [types.ts:120](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/cost/src/types.ts#L120)

Wall-clock ms (an input, never read ambiently — pass it in, so events are reproducible/testable).

***

### breakdown

> **breakdown**: `object`[]

Defined in: [types.ts:134](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/cost/src/types.ts#L134)

Per-source breakdown (µ$).

#### microUsd

> **microUsd**: `number`

#### source

> **source**: `string`

***

### dedupeKey?

> `optional` **dedupeKey?**: `string`

Defined in: [types.ts:130](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/cost/src/types.ts#L130)

Dedupe id for at-least-once event delivery — two events with the same key are the SAME charge (C024).

***

### operation

> **operation**: `string`

Defined in: [types.ts:124](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/cost/src/types.ts#L124)

Which operation (the v4 by-name handle).

***

### principal?

> `optional` **principal?**: `string`

Defined in: [types.ts:122](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/cost/src/types.ts#L122)

Who incurred it (the principal/user id), if known.

***

### reconciled?

> `optional` **reconciled?**: `boolean`

Defined in: [types.ts:132](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/cost/src/types.ts#L132)

true ⇒ totalMicroUsd is the third party's ACTUAL charge read from the event (C026), not a declared estimate.

***

### totalMicroUsd

> **totalMicroUsd**: `number`

Defined in: [types.ts:136](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/cost/src/types.ts#L136)

Total µ$ for the request.

***

### trigger?

> `optional` **trigger?**: [`CostTrigger`](../type-aliases/CostTrigger.md)

Defined in: [types.ts:128](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/cost/src/types.ts#L128)

How this cost fired (C024; default "synchronous"). A non-sync value marks a background charge.
