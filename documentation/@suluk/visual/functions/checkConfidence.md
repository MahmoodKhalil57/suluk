[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/visual](../README.md) / checkConfidence

# Function: checkConfidence()

> **checkConfidence**(`used`, `baseline`): [`ConfidenceReport`](../interfaces/ConfidenceReport.md)

Defined in: [baseline.ts:57](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/visual/src/baseline.ts#L57)

Decide, WITHOUT rendering, whether a UI built from `used` primitives is pixel-confident given the baseline.

## Parameters

### used

readonly [`UsedPrimitive`](../interfaces/UsedPrimitive.md)[]

### baseline

[`Baseline`](../type-aliases/Baseline.md)

## Returns

[`ConfidenceReport`](../interfaces/ConfidenceReport.md)
