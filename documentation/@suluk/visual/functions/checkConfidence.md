[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/visual](../README.md) / checkConfidence

# Function: checkConfidence()

> **checkConfidence**(`used`, `baseline`): [`ConfidenceReport`](../interfaces/ConfidenceReport.md)

Defined in: [baseline.ts:57](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/visual/src/baseline.ts#L57)

Decide, WITHOUT rendering, whether a UI built from `used` primitives is pixel-confident given the baseline.

## Parameters

### used

readonly [`UsedPrimitive`](../interfaces/UsedPrimitive.md)[]

### baseline

[`Baseline`](../type-aliases/Baseline.md)

## Returns

[`ConfidenceReport`](../interfaces/ConfidenceReport.md)
