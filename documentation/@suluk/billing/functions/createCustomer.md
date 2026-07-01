[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / createCustomer

# Function: createCustomer()

> **createCustomer**(`cfg`, `email`, `userId`): `Promise`\<`string`\>

Defined in: [packages/billing/src/billing.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/billing/src/billing.ts#L17)

Create a Stripe customer for the user (the caller persists the id). Routed through @suluk/payments (C048) — the
 processor is swappable; the Stripe request (POST /customers with email + metadata[userId]) is unchanged.

## Parameters

### cfg

[`StripeConfig`](../interfaces/StripeConfig.md)

### email

`string` \| `null`

### userId

`string`

## Returns

`Promise`\<`string`\>
