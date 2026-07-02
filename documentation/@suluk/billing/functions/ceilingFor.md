[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / ceilingFor

# Function: ceilingFor()

> **ceilingFor**(`metadata`, `periodEndSec`, `currentPriceCents`): `number`

Defined in: [packages/billing/src/subscriptions.ts:116](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/billing/src/subscriptions.ts#L116)

The "paid ceiling" for the CURRENT cycle = the highest plan price already CHARGED this cycle. Persisted in subscription
 metadata (raised on each above-ceiling upgrade), guarded by the period end so it auto-resets at the next renewal. Falls
 back to the current item price — a defer-change lowers the item price (for next cycle's billing) but NOT the ceiling, so
 a later change to ANY plan ≤ the ceiling stays free (you already paid for that level); only EXCEEDING it charges. PURE.

## Parameters

### metadata

`Record`\<`string`, `string`\> \| `undefined`

### periodEndSec

`number`

### currentPriceCents

`number`

## Returns

`number`
