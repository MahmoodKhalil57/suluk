[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/keys](../README.md) / topCappedPath

# Function: topCappedPath()

> **topCappedPath**(`chain`): `string` \| `null`

Defined in: [packages/keys/src/chain.ts:99](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/keys/src/chain.ts#L99)

The topmost capped node in a chain (the shortest path) — whose subtree contains every other capped node's subtree, so
 one query over it suffices for [pooledHeadroom](pooledHeadroom.md). Null when no node declares a cap.

## Parameters

### chain

[`ChainNode`](../interfaces/ChainNode.md)[]

## Returns

`string` \| `null`
