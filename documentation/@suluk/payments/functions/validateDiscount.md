[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/payments](../README.md) / validateDiscount

# Function: validateDiscount()

> **validateDiscount**(`subtotalCents`, `d`): [`DiscountResult`](../interfaces/DiscountResult.md)

Defined in: [tooling/ts/packages/payments/src/pricing.ts:76](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/payments/src/pricing.ts#L76)

Validate a discount against a subtotal, with a SPECIFIC rejection reason (PARITY: "specific discount-rejection
reasons" — a shopper is told *why*, not just "invalid"). Structural only; the app layers active/window/usage.

## Parameters

### subtotalCents

`number`

### d

[`Discount`](../interfaces/Discount.md) \| `null` \| `undefined`

## Returns

[`DiscountResult`](../interfaces/DiscountResult.md)
