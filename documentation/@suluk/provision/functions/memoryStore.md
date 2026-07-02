[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / memoryStore

# Function: memoryStore()

> **memoryStore**(`initial?`): [`StateStore`](../interfaces/StateStore.md) & `object`

Defined in: [provision/src/memory.ts:9](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/provision/src/memory.ts#L9)

A StateStore over an in-memory array (cloned on load/save so callers can't mutate the journal by reference).

## Parameters

### initial?

[`InstanceState`](../interfaces/InstanceState.md)[] = `[]`

## Returns

[`StateStore`](../interfaces/StateStore.md) & `object`
