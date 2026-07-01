[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/models](../README.md) / applyBucketing

# Function: applyBucketing()

> **applyBucketing**(`axis`, `score`): [`Tier`](../type-aliases/Tier.md)

Defined in: [bucketing.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/models/src/bucketing.ts#L32)

Bucket a raw leaderboard score into a coarse tier per the committed rule. Null/absent/unknown-axis ⇒ `unknown`.

## Parameters

### axis

`string`

### score

`number` \| `null` \| `undefined`

## Returns

[`Tier`](../type-aliases/Tier.md)
