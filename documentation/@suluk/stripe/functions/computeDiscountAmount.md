[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/stripe](../README.md) / computeDiscountAmount

# ~~Function: computeDiscountAmount()~~

> **computeDiscountAmount**(`subtotalCents`, `d`): `number`

Defined in: [pricing.ts:63](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/payments/src/pricing.ts#L63)

The cents a discount removes from `subtotalCents` — ROUNDED to a whole cent and CLAMPED to [0, subtotal] so a
discount can never exceed the order or go negative. Validation (eligibility) is `validateDiscount`; this is the
raw amount assuming the discount applies.

## Parameters

### subtotalCents

`number`

### d

[`Discount`](../interfaces/Discount.md)

## Returns

`number`
