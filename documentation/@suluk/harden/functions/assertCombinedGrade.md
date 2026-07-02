[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/harden](../README.md) / assertCombinedGrade

# Function: assertCombinedGrade()

> **assertCombinedGrade**(`grades`, `min`, `mode?`): [`CombinedGrade`](../interfaces/CombinedGrade.md)

Defined in: [audit.ts:157](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/harden/src/audit.ts#L157)

CI gate over a combined grade. Gates on the WORST dimension by default (safe); pass `mode: "average"` to soften.

## Parameters

### grades

[`Grade`](../type-aliases/Grade.md)[]

### min

[`Grade`](../type-aliases/Grade.md)

### mode?

`"worst"` \| `"average"`

## Returns

[`CombinedGrade`](../interfaces/CombinedGrade.md)
