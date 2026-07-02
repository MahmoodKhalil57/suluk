[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cost](../README.md) / computeCost

# Function: computeCost()

> **computeCost**(`model`, `usage?`): `object`

Defined in: [contract.ts:123](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/cost/src/contract.ts#L123)

Compute the actual µ$ a request cost, from its declared model + the usage the handler reported. Fixed
(per-call) components always count; variable components count their reported units × unit cost. Returns
the per-source breakdown + total — raw, for the meter to record.

## Parameters

### model

[`CostModel`](../interfaces/CostModel.md) \| `undefined`

### usage?

[`UsageReport`](../interfaces/UsageReport.md)[] = `[]`

## Returns

`object`

### breakdown

> **breakdown**: `object`[]

### totalMicroUsd

> **totalMicroUsd**: `number`
