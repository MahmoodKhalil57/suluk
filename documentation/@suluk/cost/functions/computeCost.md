[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cost](../README.md) / computeCost

# Function: computeCost()

> **computeCost**(`model`, `usage?`): `object`

Defined in: [contract.ts:123](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/cost/src/contract.ts#L123)

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
