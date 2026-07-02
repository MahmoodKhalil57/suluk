[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / createSubscriptionCheckout

# Function: createSubscriptionCheckout()

> **createSubscriptionCheckout**(`cfg`, `o`): `Promise`\<`string`\>

Defined in: [packages/billing/src/payments.ts:72](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/billing/src/payments.ts#L72)

Stripe Checkout in SUBSCRIPTION mode (recurring). subscription_data.metadata carries who + how many credits/cycle.

## Parameters

### cfg

[`StripeConfig`](../interfaces/StripeConfig.md)

### o

[`SubscriptionCheckoutOpts`](../interfaces/SubscriptionCheckoutOpts.md)

## Returns

`Promise`\<`string`\>
