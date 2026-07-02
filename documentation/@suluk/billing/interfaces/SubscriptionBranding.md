[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / SubscriptionBranding

# Interface: SubscriptionBranding

Defined in: [packages/billing/src/subscriptions.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/billing/src/subscriptions.ts#L29)

Branding seam for the Stripe Product/Price a plan creates — app-controlled so find-or-create stays stable + on-brand.

## Properties

### lookupKeyPrefix?

> `optional` **lookupKeyPrefix?**: `string`

Defined in: [packages/billing/src/subscriptions.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/billing/src/subscriptions.ts#L33)

the lookup_key PREFIX that makes find-or-create idempotent across repricing; default "sub". KEEP STABLE per app.

***

### productName?

> `optional` **productName?**: (`plan`) => `string`

Defined in: [packages/billing/src/subscriptions.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/billing/src/subscriptions.ts#L31)

the recurring Price's product name; default `${plan.name} (monthly)`.

#### Parameters

##### plan

[`SubPlan`](SubPlan.md)

#### Returns

`string`
