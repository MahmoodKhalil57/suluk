[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / memoryStore

# Function: memoryStore()

> **memoryStore**(`initial?`): [`StateStore`](../interfaces/StateStore.md) & `object`

Defined in: [provision/src/memory.ts:9](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/provision/src/memory.ts#L9)

A StateStore over an in-memory array (cloned on load/save so callers can't mutate the journal by reference).

## Parameters

### initial?

[`InstanceState`](../interfaces/InstanceState.md)[] = `[]`

## Returns

[`StateStore`](../interfaces/StateStore.md) & `object`
