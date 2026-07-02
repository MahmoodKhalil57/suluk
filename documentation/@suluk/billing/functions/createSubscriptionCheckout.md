[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / createSubscriptionCheckout

# Function: createSubscriptionCheckout()

> **createSubscriptionCheckout**(`cfg`, `o`): `Promise`\<`string`\>

Defined in: [packages/billing/src/payments.ts:72](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/billing/src/payments.ts#L72)

Stripe Checkout in SUBSCRIPTION mode (recurring). subscription_data.metadata carries who + how many credits/cycle.

## Parameters

### cfg

[`StripeConfig`](../interfaces/StripeConfig.md)

### o

[`SubscriptionCheckoutOpts`](../interfaces/SubscriptionCheckoutOpts.md)

## Returns

`Promise`\<`string`\>
