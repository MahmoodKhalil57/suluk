[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/payments](../README.md) / Discount

# Interface: Discount

Defined in: [tooling/ts/packages/payments/src/pricing.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/payments/src/pricing.ts#L23)

A discount's MATH shape (the structural part; app-side eligibility rules are separate).

## Properties

### maxDiscountCents?

> `optional` **maxDiscountCents?**: `number`

Defined in: [tooling/ts/packages/payments/src/pricing.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/payments/src/pricing.ts#L30)

cap the amount removed (cents) — e.g. "30% off, up to $50". Applied before the [0, subtotal] clamp.

***

### minSubtotalCents?

> `optional` **minSubtotalCents?**: `number`

Defined in: [tooling/ts/packages/payments/src/pricing.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/payments/src/pricing.ts#L28)

the discount only applies at/above this subtotal (cents).

***

### type

> **type**: `"percent"` \| `"fixed"`

Defined in: [tooling/ts/packages/payments/src/pricing.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/payments/src/pricing.ts#L24)

***

### value

> **value**: `number`

Defined in: [tooling/ts/packages/payments/src/pricing.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/payments/src/pricing.ts#L26)

percent: 0–100; fixed: cents off the subtotal.
