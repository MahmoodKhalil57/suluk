[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / checkDrift

# Function: checkDrift()

> **checkDrift**(`config`, `state`): [`DriftReport`](../interfaces/DriftReport.md)

Defined in: [provision/src/check.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/provision/src/check.ts#L18)

Report whether live state matches the config (orphans counted only when pruning is the config default).

## Parameters

### config

[`ProvisionConfig`](../interfaces/ProvisionConfig.md)

### state

[`InstanceState`](../interfaces/InstanceState.md)[]

## Returns

[`DriftReport`](../interfaces/DriftReport.md)
