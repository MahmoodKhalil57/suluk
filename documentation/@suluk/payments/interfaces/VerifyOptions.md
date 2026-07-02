[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/payments](../README.md) / VerifyOptions

# Interface: VerifyOptions

Defined in: [tooling/ts/packages/payments/src/stripe-webhook.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/payments/src/stripe-webhook.ts#L18)

## Properties

### now?

> `optional` **now?**: () => `number`

Defined in: [tooling/ts/packages/payments/src/stripe-webhook.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/payments/src/stripe-webhook.ts#L20)

current unix seconds (default `Date.now()/1000`) — injectable for tests + replay-window tuning.

#### Returns

`number`

***

### toleranceSec?

> `optional` **toleranceSec?**: `number`

Defined in: [tooling/ts/packages/payments/src/stripe-webhook.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/payments/src/stripe-webhook.ts#L22)

reject events whose timestamp is older than this many seconds (default 300 — Stripe's window).
