[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / checkDrift

# Function: checkDrift()

> **checkDrift**(`config`, `state`): [`DriftReport`](../interfaces/DriftReport.md)

Defined in: [provision/src/check.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/check.ts#L18)

Report whether live state matches the config (orphans counted only when pruning is the config default).

## Parameters

### config

[`ProvisionConfig`](../interfaces/ProvisionConfig.md)

### state

[`InstanceState`](../interfaces/InstanceState.md)[]

## Returns

[`DriftReport`](../interfaces/DriftReport.md)
