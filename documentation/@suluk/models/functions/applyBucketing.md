[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/models](../README.md) / applyBucketing

# Function: applyBucketing()

> **applyBucketing**(`axis`, `score`): [`Tier`](../type-aliases/Tier.md)

Defined in: [bucketing.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/models/src/bucketing.ts#L32)

Bucket a raw leaderboard score into a coarse tier per the committed rule. Null/absent/unknown-axis ⇒ `unknown`.

## Parameters

### axis

`string`

### score

`number` \| `null` \| `undefined`

## Returns

[`Tier`](../type-aliases/Tier.md)
