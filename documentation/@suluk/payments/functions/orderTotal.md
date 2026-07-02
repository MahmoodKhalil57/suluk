[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/payments](../README.md) / orderTotal

# Function: orderTotal()

> **orderTotal**(`lines`, `discount?`): [`OrderTotal`](../interfaces/OrderTotal.md)

Defined in: [tooling/ts/packages/payments/src/pricing.ts:109](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/payments/src/pricing.ts#L109)

Compose the authoritative order total from lines + an optional (already-validated) discount.

## Parameters

### lines

[`CartLine`](../interfaces/CartLine.md)[]

### discount?

[`Discount`](../interfaces/Discount.md) \| `null`

## Returns

[`OrderTotal`](../interfaces/OrderTotal.md)
