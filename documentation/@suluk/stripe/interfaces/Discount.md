[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/stripe](../README.md) / Discount

# Interface: Discount

Defined in: [pricing.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/payments/src/pricing.ts#L23)

A discount's MATH shape (the structural part; app-side eligibility rules are separate).

## Properties

### maxDiscountCents?

> `optional` **maxDiscountCents?**: `number`

Defined in: [pricing.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/payments/src/pricing.ts#L30)

cap the amount removed (cents) — e.g. "30% off, up to $50". Applied before the [0, subtotal] clamp.

***

### minSubtotalCents?

> `optional` **minSubtotalCents?**: `number`

Defined in: [pricing.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/payments/src/pricing.ts#L28)

the discount only applies at/above this subtotal (cents).

***

### type

> **type**: `"percent"` \| `"fixed"`

Defined in: [pricing.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/payments/src/pricing.ts#L24)

***

### value

> **value**: `number`

Defined in: [pricing.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/payments/src/pricing.ts#L26)

percent: 0–100; fixed: cents off the subtotal.
