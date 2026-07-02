[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/stripe](../README.md) / cartFingerprint

# ~~Function: cartFingerprint()~~

> **cartFingerprint**(`lines`, `discount?`): `string`

Defined in: [pricing.ts:148](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/payments/src/pricing.ts#L148)

A stable fingerprint of the priced cart (+ discount) — order-independent over lines. Two carts that should be
charged identically produce the same fingerprint; any price/qty/discount change produces a different one.

## Parameters

### lines

[`CartLine`](../interfaces/CartLine.md)[]

### discount?

[`Discount`](../interfaces/Discount.md) \| `null`

## Returns

`string`
