[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / SelectResult

# Interface: SelectResult

Defined in: [models/src/types.ts:114](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/models/src/types.ts#L114)

## Properties

### candidateCount

> **candidateCount**: `number`

Defined in: [models/src/types.ts:118](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/models/src/types.ts#L118)

the count after hard filtering.

***

### coverageGaps

> **coverageGaps**: `string`[]

Defined in: [models/src/types.ts:122](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/models/src/types.ts#L122)

UNKNOWN-coverage warning: soft axes with no data on the winner (honesty surface).

***

### ranked

> **ranked**: [`RankedModel`](../../models/interfaces/RankedModel.md)[]

Defined in: [models/src/types.ts:116](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/models/src/types.ts#L116)

ranked best-first; empty when no model satisfies the hard filters.

***

### unsatisfiable?

> `optional` **unsatisfiable?**: `string`[]

Defined in: [models/src/types.ts:120](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/models/src/types.ts#L120)

present when the requirements emptied the set — names the unsatisfiable filter(s).
