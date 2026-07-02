[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/payments](../README.md) / cartFingerprint

# Function: cartFingerprint()

> **cartFingerprint**(`lines`, `discount?`): `string`

Defined in: [tooling/ts/packages/payments/src/pricing.ts:148](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/payments/src/pricing.ts#L148)

A stable fingerprint of the priced cart (+ discount) — order-independent over lines. Two carts that should be
charged identically produce the same fingerprint; any price/qty/discount change produces a different one.

## Parameters

### lines

[`CartLine`](../interfaces/CartLine.md)[]

### discount?

[`Discount`](../interfaces/Discount.md) \| `null`

## Returns

`string`
