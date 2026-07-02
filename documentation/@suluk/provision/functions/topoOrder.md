[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / topoOrder

# Function: topoOrder()

> **topoOrder**(`instances`): [`InstanceSpec`](../interfaces/InstanceSpec.md)[]

Defined in: [provision/src/dag.ts:11](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/provision/src/dag.ts#L11)

Order `instances` so each comes after its binding producers. Stable (config order breaks ties). Throws on a cycle or
 a reference to an undeclared instance.

## Parameters

### instances

[`InstanceSpec`](../interfaces/InstanceSpec.md)[]

## Returns

[`InstanceSpec`](../interfaces/InstanceSpec.md)[]
