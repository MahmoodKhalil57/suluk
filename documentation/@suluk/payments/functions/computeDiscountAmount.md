[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/payments](../README.md) / computeDiscountAmount

# Function: computeDiscountAmount()

> **computeDiscountAmount**(`subtotalCents`, `d`): `number`

Defined in: [tooling/ts/packages/payments/src/pricing.ts:63](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/payments/src/pricing.ts#L63)

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
