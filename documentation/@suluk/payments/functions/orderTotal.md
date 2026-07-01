[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/payments](../README.md) / orderTotal

# Function: orderTotal()

> **orderTotal**(`lines`, `discount?`): [`OrderTotal`](../interfaces/OrderTotal.md)

Defined in: [tooling/ts/packages/payments/src/pricing.ts:109](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/payments/src/pricing.ts#L109)

Compose the authoritative order total from lines + an optional (already-validated) discount.

## Parameters

### lines

[`CartLine`](../interfaces/CartLine.md)[]

### discount?

[`Discount`](../interfaces/Discount.md) \| `null`

## Returns

[`OrderTotal`](../interfaces/OrderTotal.md)
