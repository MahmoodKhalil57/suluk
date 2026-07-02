[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / CheckoutOpts

# Interface: CheckoutOpts

Defined in: [packages/billing/src/payments.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/billing/src/payments.ts#L20)

## Properties

### amountCents

> **amountCents**: `number`

Defined in: [packages/billing/src/payments.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/billing/src/payments.ts#L24)

***

### cancelUrl

> **cancelUrl**: `string`

Defined in: [packages/billing/src/payments.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/billing/src/payments.ts#L28)

***

### credits

> **credits**: `number`

Defined in: [packages/billing/src/payments.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/billing/src/payments.ts#L25)

***

### customerId

> **customerId**: `string` \| `null`

Defined in: [packages/billing/src/payments.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/billing/src/payments.ts#L23)

the user's existing customer (reused so a saved card isn't orphaned), or null to let Checkout create one.

***

### productName

> **productName**: `string`

Defined in: [packages/billing/src/payments.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/billing/src/payments.ts#L30)

the line-item product name shown on the hosted page, e.g. "acme — 600 credits".

***

### successUrl

> **successUrl**: `string`

Defined in: [packages/billing/src/payments.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/billing/src/payments.ts#L27)

the URL Stripe returns to on success (the app composes it from its origin + route).

***

### userId

> **userId**: `string`

Defined in: [packages/billing/src/payments.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/billing/src/payments.ts#L21)
