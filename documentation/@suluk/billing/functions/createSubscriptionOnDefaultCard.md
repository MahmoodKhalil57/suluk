[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / createSubscriptionOnDefaultCard

# Function: createSubscriptionOnDefaultCard()

> **createSubscriptionOnDefaultCard**(`cfg`, `customerId`, `plan`, `userId`, `branding?`): `Promise`\<\{ `clientSecret`: `string`; `subscriptionId`: `string`; \} \| `null`\>

Defined in: [packages/billing/src/subscriptions.ts:78](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/billing/src/subscriptions.ts#L78)

Create a subscription ON the saved default card (one-click). payment_behavior=default_incomplete leaves the first
 invoice unpaid with a PaymentIntent the browser confirms (confirmCardPayment → 3DS in-page) → the subscription
 activates → invoice.paid grants the cycle's credits. Returns the first invoice's client secret + the subscription id,
 or null when there's no default card.

## Parameters

### cfg

[`StripeConfig`](../interfaces/StripeConfig.md)

### customerId

`string`

### plan

[`SubPlan`](../interfaces/SubPlan.md)

### userId

`string`

### branding?

[`SubscriptionBranding`](../interfaces/SubscriptionBranding.md)

## Returns

`Promise`\<\{ `clientSecret`: `string`; `subscriptionId`: `string`; \} \| `null`\>
