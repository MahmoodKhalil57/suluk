[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/keys](../README.md) / expiredAncestor

# Function: expiredAncestor()

> **expiredAncestor**(`chain`, `callerKeyId`, `now`): `boolean`

Defined in: [packages/keys/src/chain.ts:54](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/keys/src/chain.ts#L54)

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
