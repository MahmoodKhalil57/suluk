[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/payments](../README.md) / prorateDiscount

# Function: prorateDiscount()

> **prorateDiscount**(`lines`, `discountCents`): `number`[]

Defined in: [tooling/ts/packages/payments/src/pricing.ts:89](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/payments/src/pricing.ts#L89)

Split `discountCents` across `lines` proportionally to each line's total, as whole cents that sum EXACTLY to
`discountCents` (largest-remainder apportionment). This is what keeps the cart drawer and the order summary
from disagreeing by a cent. Each line's share is clamped to its own total.

## Parameters

### lines

[`CartLine`](../interfaces/CartLine.md)[]

### discountCents

`number`

## Returns

`number`[]
