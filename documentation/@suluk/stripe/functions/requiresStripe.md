[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/stripe](../README.md) / requiresStripe

# ~~Function: requiresStripe()~~

> **requiresStripe**(`totalCents`): `boolean`

Defined in: [pricing.ts:38](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/payments/src/pricing.ts#L38)

Does this total require a real Stripe charge, or can it complete as a free order? Centralizes the $0.50 floor
 decision so the free-checkout branch and the Stripe branch can never disagree about where $0–$0.49 goes.

## Parameters

### totalCents

`number`

## Returns

`boolean`
