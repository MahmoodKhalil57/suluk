[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / claimRows

# Function: claimRows()

> **claimRows**\<`T`\>(`db`, `table`, `where`, `set`): `Promise`\<`T`[]\>

Defined in: [cas.ts:40](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/drizzle/src/cas.ts#L40)

Atomically CLAIM a SET of rows and RETURN them: `UPDATE table SET set WHERE where RETURNING *`. The claim-then-act
variant of [claimOnce](claimOnce.md) — for a batch sweep (mark a waitlist notified / a cart-recovery emailed) where each
row must be handled exactly once even if the sweep overlaps: a concurrent run's UPDATE claims a DISJOINT set, so
the side-effect (email, notify) fires once per row. Returns the rows THIS call won; act only on those.

## Type Parameters

### T

`T` = `Record`\<`string`, `unknown`\>

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

`Promise`\<`T`[]\>
