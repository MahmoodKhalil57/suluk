[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / promoteFeatureExamples

# Function: promoteFeatureExamples()

> **promoteFeatureExamples**(`source`, `features`, `resolveTarget`, `provenancePrefix?`): [`PromoteFeatureResult`](../interfaces/PromoteFeatureResult.md)

Defined in: [journeys/src/promote.ts:201](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/journeys/src/promote.ts#L201)

Orchestrate promotion for a whole feature set: for each `@public` Examples row, resolve its target (the consumer maps
scenario → schemaVar + body schema — the app knows that wiring), build the example, and apply it. Adapter-seam shaped.

## Parameters

### source

`string`

### features

[`Feature`](../interfaces/Feature.md)[]

### resolveTarget

(`scenario`) => [`PromoteTarget`](../interfaces/PromoteTarget.md) \| `null`

### provenancePrefix?

`string` = `"promoted from"`

## Returns

[`PromoteFeatureResult`](../interfaces/PromoteFeatureResult.md)
