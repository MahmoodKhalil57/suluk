[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/stripe](../README.md) / prorateDiscount

# ~~Function: prorateDiscount()~~

> **prorateDiscount**(`lines`, `discountCents`): `number`[]

Defined in: [pricing.ts:89](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/payments/src/pricing.ts#L89)

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
