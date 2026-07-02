[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/stripe](../README.md) / cartFingerprint

# ~~Function: cartFingerprint()~~

> **cartFingerprint**(`lines`, `discount?`): `string`

Defined in: [pricing.ts:148](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/payments/src/pricing.ts#L148)

A stable fingerprint of the priced cart (+ discount) — order-independent over lines. Two carts that should be
charged identically produce the same fingerprint; any price/qty/discount change produces a different one.

## Parameters

### lines

[`CartLine`](../interfaces/CartLine.md)[]

### discount?

[`Discount`](../interfaces/Discount.md) \| `null`

## Returns

`string`
