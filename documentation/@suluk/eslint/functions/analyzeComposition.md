[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/eslint](../README.md) / analyzeComposition

# Function: analyzeComposition()

> **analyzeComposition**(`source`, `options?`): [`Violation`](../interfaces/Violation.md)[]

Defined in: [analyze.ts:80](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/eslint/src/analyze.ts#L80)

Collect every violation, then apply each metric's budget (report only the occurrences BEYOND the budget).

## Parameters

### source

`string`

### options?

[`CompositionOptions`](../interfaces/CompositionOptions.md) = `{}`

## Returns

[`Violation`](../interfaces/Violation.md)[]
