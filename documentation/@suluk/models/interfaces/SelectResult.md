[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/models](../README.md) / SelectResult

# Interface: SelectResult

Defined in: [types.ts:114](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/models/src/types.ts#L114)

## Properties

### candidateCount

> **candidateCount**: `number`

Defined in: [types.ts:118](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/models/src/types.ts#L118)

the count after hard filtering.

***

### coverageGaps

> **coverageGaps**: `string`[]

Defined in: [types.ts:122](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/models/src/types.ts#L122)

UNKNOWN-coverage warning: soft axes with no data on the winner (honesty surface).

***

### ranked

> **ranked**: [`RankedModel`](RankedModel.md)[]

Defined in: [types.ts:116](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/models/src/types.ts#L116)

ranked best-first; empty when no model satisfies the hard filters.

***

### unsatisfiable?

> `optional` **unsatisfiable?**: `string`[]

Defined in: [types.ts:120](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/models/src/types.ts#L120)

present when the requirements emptied the set — names the unsatisfiable filter(s).
