[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/harden](../README.md) / assertCombinedGrade

# Function: assertCombinedGrade()

> **assertCombinedGrade**(`grades`, `min`, `mode?`): [`CombinedGrade`](../interfaces/CombinedGrade.md)

Defined in: [audit.ts:157](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/harden/src/audit.ts#L157)

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
