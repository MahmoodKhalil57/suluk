[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/stripe](../README.md) / prorateDiscount

# ~~Function: prorateDiscount()~~

> **prorateDiscount**(`lines`, `discountCents`): `number`[]

Defined in: [pricing.ts:89](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/payments/src/pricing.ts#L89)

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
