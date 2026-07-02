[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/stripe](../README.md) / orderTotal

# ~~Function: orderTotal()~~

> **orderTotal**(`lines`, `discount?`): [`OrderTotal`](../interfaces/OrderTotal.md)

Defined in: [pricing.ts:109](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/payments/src/pricing.ts#L109)

Compose the authoritative order total from lines + an optional (already-validated) discount.

## Parameters

### lines

[`CartLine`](../interfaces/CartLine.md)[]

### discount?

[`Discount`](../interfaces/Discount.md) \| `null`

## Returns

[`OrderTotal`](../interfaces/OrderTotal.md)
