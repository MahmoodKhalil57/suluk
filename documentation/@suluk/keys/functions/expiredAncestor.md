[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/keys](../README.md) / expiredAncestor

# Function: expiredAncestor()

> **expiredAncestor**(`chain`, `callerKeyId`, `now`): `boolean`

Defined in: [packages/keys/src/chain.ts:54](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/keys/src/chain.ts#L54)

TRUE when any ANCESTOR (a node other than the caller) has already expired — so the caller auto-expires the moment a
 parent does. The caller's OWN expiry is enforced upstream (the token verify rejects it), so it's excluded.

## Parameters

### chain

[`ChainNode`](../interfaces/ChainNode.md)[]

### callerKeyId

`string`

### now

`number`

## Returns

`boolean`
