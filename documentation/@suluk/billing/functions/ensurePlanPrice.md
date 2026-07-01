[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / ensurePlanPrice

# Function: ensurePlanPrice()

> **ensurePlanPrice**(`cfg`, `plan`, `branding?`): `Promise`\<`string`\>

Defined in: [packages/billing/src/subscriptions.ts:55](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/billing/src/subscriptions.ts#L55)

Find (by lookup_key) or create the recurring Stripe Price for a plan. The lookup_key embeds the price + credits, so a
 repricing mints a FRESH price rather than reusing a stale one. Returns the price id.

## Parameters

### cfg

[`StripeConfig`](../interfaces/StripeConfig.md)

### plan

[`SubPlan`](../interfaces/SubPlan.md)

### branding?

[`SubscriptionBranding`](../interfaces/SubscriptionBranding.md)

## Returns

`Promise`\<`string`\>
