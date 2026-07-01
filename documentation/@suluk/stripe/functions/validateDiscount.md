[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/stripe](../README.md) / validateDiscount

# ~~Function: validateDiscount()~~

> **validateDiscount**(`subtotalCents`, `d`): [`DiscountResult`](../interfaces/DiscountResult.md)

Defined in: [pricing.ts:76](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/payments/src/pricing.ts#L76)

Validate a discount against a subtotal, with a SPECIFIC rejection reason (PARITY: "specific discount-rejection
reasons" — a shopper is told *why*, not just "invalid"). Structural only; the app layers active/window/usage.

## Parameters

### subtotalCents

`number`

### d

[`Discount`](../interfaces/Discount.md) \| `null` \| `undefined`

## Returns

[`DiscountResult`](../interfaces/DiscountResult.md)
