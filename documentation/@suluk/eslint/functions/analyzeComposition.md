[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/eslint](../README.md) / analyzeComposition

# Function: analyzeComposition()

> **analyzeComposition**(`source`, `options?`): [`Violation`](../interfaces/Violation.md)[]

Defined in: [analyze.ts:80](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/eslint/src/analyze.ts#L80)

Collect every violation, then apply each metric's budget (report only the occurrences BEYOND the budget).

## Parameters

### source

`string`

### options?

[`CompositionOptions`](../interfaces/CompositionOptions.md) = `{}`

## Returns

[`Violation`](../interfaces/Violation.md)[]
