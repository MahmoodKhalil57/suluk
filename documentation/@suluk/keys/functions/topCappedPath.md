[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/keys](../README.md) / topCappedPath

# Function: topCappedPath()

> **topCappedPath**(`chain`): `string` \| `null`

Defined in: [packages/keys/src/chain.ts:99](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/keys/src/chain.ts#L99)

The topmost capped node in a chain (the shortest path) — whose subtree contains every other capped node's subtree, so
 one query over it suffices for [pooledHeadroom](pooledHeadroom.md). Null when no node declares a cap.

## Parameters

### chain

[`ChainNode`](../interfaces/ChainNode.md)[]

## Returns

`string` \| `null`
