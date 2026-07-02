[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/keys](../README.md) / effectiveCaps

# Function: effectiveCaps()

> **effectiveCaps**(`chain`): [`EffectiveCaps`](../interfaces/EffectiveCaps.md)

Defined in: [packages/keys/src/chain.ts:38](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/keys/src/chain.ts#L38)

The caller's EFFECTIVE grant, derived by walking UP the chain. Scopes = the intersection of every node's grant; the
 credit cap + rate share + expiry = the MIN (soonest) of the declared (non-null) ones. The depth-0 identity for a plain
 root key (one node → its own values), so single-key behaviour is preserved.

## Parameters

### chain

[`ChainNode`](../interfaces/ChainNode.md)[]

## Returns

[`EffectiveCaps`](../interfaces/EffectiveCaps.md)
