[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/models](../README.md) / applyBucketing

# Function: applyBucketing()

> **applyBucketing**(`axis`, `score`): [`Tier`](../type-aliases/Tier.md)

Defined in: [bucketing.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/models/src/bucketing.ts#L32)

Bucket a raw leaderboard score into a coarse tier per the committed rule. Null/absent/unknown-axis ⇒ `unknown`.

## Parameters

### axis

`string`

### score

`number` \| `null` \| `undefined`

## Returns

[`Tier`](../type-aliases/Tier.md)
