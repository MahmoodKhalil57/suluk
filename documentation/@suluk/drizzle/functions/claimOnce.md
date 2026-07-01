[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / claimOnce

# Function: claimOnce()

> **claimOnce**(`db`, `table`, `where`, `set`): `Promise`\<`boolean`\>

Defined in: [cas.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/drizzle/src/cas.ts#L29)

Atomically CLAIM a transition: `UPDATE table SET set WHERE where`, returning true iff this call changed a row.
The `where` MUST include the FROM-state guard (e.g. `and(eq(id, n), eq(status, "pending"))`) so a re-delivery /
concurrent caller finds the row already transitioned and changes nothing → returns false. The single point that
makes a once-only side-effect (charge, refund, decrement, email) safe to run when, and only when, the claim wins.

## Parameters

### db

[`ClaimDb`](../interfaces/ClaimDb.md)

### table

`unknown`

### where

`SQL`

### set

`Record`\<`string`, `unknown`\>

## Returns

`Promise`\<`boolean`\>
