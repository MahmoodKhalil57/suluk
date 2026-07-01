[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / planByPrice

# Function: planByPrice()

> **planByPrice**(`plans`, `priceCents`): [`SubPlan`](../interfaces/SubPlan.md) \| `undefined`

Defined in: [packages/billing/src/subscriptions.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/billing/src/subscriptions.ts#L26)

The plan whose monthly price is exactly `priceCents` (each tier has a distinct price), or undefined — maps a live
 Stripe item price back to a plan (e.g. resolving the paid-ceiling plan).

## Parameters

### plans

[`SubPlan`](../interfaces/SubPlan.md)[]

### priceCents

`number`

## Returns

[`SubPlan`](../interfaces/SubPlan.md) \| `undefined`
