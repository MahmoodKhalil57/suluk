[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/stripe](../README.md) / VerifyOptions

# Interface: VerifyOptions

Defined in: [stripe-webhook.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/payments/src/stripe-webhook.ts#L18)

## Properties

### now?

> `optional` **now?**: () => `number`

Defined in: [stripe-webhook.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/payments/src/stripe-webhook.ts#L20)

current unix seconds (default `Date.now()/1000`) — injectable for tests + replay-window tuning.

#### Returns

`number`

***

### toleranceSec?

> `optional` **toleranceSec?**: `number`

Defined in: [stripe-webhook.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/payments/src/stripe-webhook.ts#L22)

reject events whose timestamp is older than this many seconds (default 300 — Stripe's window).
