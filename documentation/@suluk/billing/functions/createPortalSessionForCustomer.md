[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / createPortalSessionForCustomer

# Function: createPortalSessionForCustomer()

> **createPortalSessionForCustomer**(`cfg`, `customerId`, `returnUrl`): `Promise`\<`string`\>

Defined in: [packages/billing/src/payments.ts:93](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/billing/src/payments.ts#L93)

Open the Stripe billing portal (manage/cancel) for an existing customer. Returns the URL; throws on a Stripe error.

## Parameters

### cfg

[`StripeConfig`](../interfaces/StripeConfig.md)

### customerId

`string`

### returnUrl

`string`

## Returns

`Promise`\<`string`\>
