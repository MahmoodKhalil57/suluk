[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / reconcile

# Function: reconcile()

> **reconcile**(`state`, `report`): [`InstanceState`](../interfaces/InstanceState.md)[]

Defined in: [provision/src/pull.ts:65](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/pull.ts#L65)

Fold a pull report into the journal: DROP externally-deleted instances (so the next `apply` re-creates them) + MERGE
 live outputs over drifted ones (never dropping a bound value the provider doesn't know, e.g. a minted token). Pure —
 returns the reconciled state; the caller saves it.

## Parameters

### state

[`InstanceState`](../interfaces/InstanceState.md)[]

### report

[`PullReport`](../interfaces/PullReport.md)

## Returns

[`InstanceState`](../interfaces/InstanceState.md)[]
