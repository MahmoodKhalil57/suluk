[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/eslint](../README.md) / analyzeComposition

# Function: analyzeComposition()

> **analyzeComposition**(`source`, `options?`): [`Violation`](../interfaces/Violation.md)[]

Defined in: [analyze.ts:80](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/eslint/src/analyze.ts#L80)

Collect every violation, then apply each metric's budget (report only the occurrences BEYOND the budget).

## Parameters

### source

`string`

### options?

[`CompositionOptions`](../interfaces/CompositionOptions.md) = `{}`

## Returns

[`Violation`](../interfaces/Violation.md)[]
