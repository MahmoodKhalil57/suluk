[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/keys](../README.md) / disabledAncestor

# Function: disabledAncestor()

> **disabledAncestor**(`chain`, `callerKeyId`): `boolean`

Defined in: [packages/keys/src/chain.ts:61](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/keys/src/chain.ts#L61)

TRUE when any ANCESTOR has been soft-disabled — so a child auto-dies the moment a parent is revoked, EVEN when the
 revocation didn't cascade through the write path. The read-time half of the cascade. The caller's OWN disable is
 enforced upstream, so it's excluded.

## Parameters

### chain

[`ChainNode`](../interfaces/ChainNode.md)[]

### callerKeyId

`string`

## Returns

`boolean`
