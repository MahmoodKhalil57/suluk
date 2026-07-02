[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / checkDrift

# Function: checkDrift()

> **checkDrift**(`config`, `state`): [`DriftReport`](../interfaces/DriftReport.md)

Defined in: [provision/src/check.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/provision/src/check.ts#L18)

Report whether live state matches the config (orphans counted only when pruning is the config default).

## Parameters

### config

[`ProvisionConfig`](../interfaces/ProvisionConfig.md)

### state

[`InstanceState`](../interfaces/InstanceState.md)[]

## Returns

[`DriftReport`](../interfaces/DriftReport.md)
