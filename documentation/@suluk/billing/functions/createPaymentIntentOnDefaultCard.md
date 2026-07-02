[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / createPaymentIntentOnDefaultCard

# Function: createPaymentIntentOnDefaultCard()

> **createPaymentIntentOnDefaultCard**(`cfg`, `customerId`, `amountCents`, `meta`): `Promise`\<`string` \| `null`\>

Defined in: [packages/billing/src/payments.ts:104](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/billing/src/payments.ts#L104)

Create a PaymentIntent on the customer's SAVED DEFAULT card — the one-click top-up path. The server resolves the
 default payment method (client can't inject one), pins the PI to it, and returns the client secret; the browser
 confirms (3DS in-page if needed). Returns null when there's no default card to charge. No setup_future_usage — the
 card is already saved.

## Parameters

### cfg

[`StripeConfig`](../interfaces/StripeConfig.md)

### customerId

`string`

### amountCents

`number`

### meta

[`TopupMeta`](../type-aliases/TopupMeta.md)

## Returns

`Promise`\<`string` \| `null`\>
