[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / SubscriptionStatus

# Interface: SubscriptionStatus

Defined in: [packages/billing/src/subscriptions.ts:125](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/billing/src/subscriptions.ts#L125)

The user's CURRENT subscription as the UI needs it (plan + status + period end + pending-cancel + the cycle's paid
 ceiling), or null when there's no live subscription. Live state from Stripe; `plans` is the app catalog for the
 price fallback when the live item lacks one.

## Properties

### cancelAtPeriodEnd

> **cancelAtPeriodEnd**: `boolean`

Defined in: [packages/billing/src/subscriptions.ts:129](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/billing/src/subscriptions.ts#L129)

***

### currentPeriodEnd

> **currentPeriodEnd**: `number`

Defined in: [packages/billing/src/subscriptions.ts:128](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/billing/src/subscriptions.ts#L128)

***

### paidCeilingCents

> **paidCeilingCents**: `number`

Defined in: [packages/billing/src/subscriptions.ts:130](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/billing/src/subscriptions.ts#L130)

***

### planId

> **planId**: `string` \| `null`

Defined in: [packages/billing/src/subscriptions.ts:126](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/billing/src/subscriptions.ts#L126)

***

### status

> **status**: `string`

Defined in: [packages/billing/src/subscriptions.ts:127](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/billing/src/subscriptions.ts#L127)
