[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/payments](../README.md) / prorateDiscount

# Function: prorateDiscount()

> **prorateDiscount**(`lines`, `discountCents`): `number`[]

Defined in: [tooling/ts/packages/payments/src/pricing.ts:89](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/payments/src/pricing.ts#L89)

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
