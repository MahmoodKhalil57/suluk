[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / stripeGet

# Function: stripeGet()

> **stripeGet**(`cfg`, `path`): `Promise`\<`Response`\>

Defined in: [packages/payments/src/stripe-transport.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/payments/src/stripe-transport.ts#L28)

`@suluk/billing` — Stripe plumbing over an injected config (C046). The transport + customer/intent creation + the
saved-card surface (v1), plus the money-MOVING paths (hosted Checkout, portal, on-default-card top-up, off-session
charge), the pricing-woven subscription logic made generic over a SubPlan catalog, the Stripe Tax mechanics, and the
package-owned billing-account store (v2). Ported with the source's `res.ok`/field semantics verbatim; the Effect-Schema
defensive decode is dropped (plain typed JSON access → no `effect` dep). STAYS APP (policy, not library): the Stripe
WEBHOOK dispatch (composes @suluk/stripe webhookRouter + these primitives + @suluk/credits.grantOnce), the branded
email templates, payment-alert kinds, and refund/subscription-pooling (operator-excluded from the start).

## Parameters

### cfg

[`StripeConfig`](../interfaces/StripeConfig.md)

### path

`string`

## Returns

`Promise`\<`Response`\>
