[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/keys](../README.md) / pooledHeadroom

# Function: pooledHeadroom()

> **pooledHeadroom**(`chain`, `spendRows`): [`Headroom`](../interfaces/Headroom.md) \| `null`

Defined in: [packages/keys/src/chain.ts:84](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/keys/src/chain.ts#L84)

The chain's POOLED credit headroom — the BINDING constraint a charge must clear: over every node that declares an own
cap, the LEAST `cap − subtreeSpend(node)` (a node's subtree = itself ∪ descendants). Pooling is what makes a cap
abuse-proof: a parent capped at 50 can't mint children to spend 50 each, because every child's spend lands in the
parent's subtree. The app fetches `spendRows` (per-path spend over the topmost capped node's subtree — one grouped
query); this sums per node in O(nodes × rows). Returns null when no node declares a cap (uncapped — only the balance gates).

## Parameters

### chain

[`ChainNode`](../interfaces/ChainNode.md)[]

### spendRows

readonly [`SpendRow`](../interfaces/SpendRow.md)[]

## Returns

[`Headroom`](../interfaces/Headroom.md) \| `null`
