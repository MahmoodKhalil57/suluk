[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/keys](../README.md) / chainHeadroom

# Function: chainHeadroom()

> **chainHeadroom**(`db`, `chain`): `Promise`\<[`Headroom`](../interfaces/Headroom.md) \| `null`\>

Defined in: [packages/keys/src/lineage.ts:61](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/keys/src/lineage.ts#L61)

The chain's POOLED credit headroom — one grouped query over the TOPMOST capped node's subtree (joining the credit
ledger via the `credit_key` sidecar), then [pooledHeadroom](pooledHeadroom.md). This is where the abuse-proof cap becomes real: a
parent's cap bounds its whole subtree's spend. Null when no node in the chain declares a cap (uncapped).

## Parameters

### db

[`KeysDB`](../type-aliases/KeysDB.md)

### chain

[`ChainNode`](../interfaces/ChainNode.md)[]

## Returns

`Promise`\<[`Headroom`](../interfaces/Headroom.md) \| `null`\>
