# Functions

## stripe-transport

### `stripePost`
`@suluk/billing` — Stripe plumbing over an injected config (C046). The transport + customer/intent creation + the
saved-card surface (v1), plus the money-MOVING paths (hosted Checkout, portal, on-default-card top-up, off-session
charge), the pricing-woven subscription logic made generic over a SubPlan catalog, the Stripe Tax mechanics, and the
package-owned billing-account store (v2). Ported with the source's `res.ok`/field semantics verbatim; the Effect-Schema
defensive decode is dropped (plain typed JSON access → no `effect` dep). STAYS APP (policy, not library): the Stripe
WEBHOOK dispatch (composes @suluk/stripe webhookRouter + these primitives + @suluk/credits.grantOnce), the branded
email templates, payment-alert kinds, and refund/subscription-pooling (operator-excluded from the start).
```ts
stripePost(cfg: StripeConfig, path: string, form: URLSearchParams, idempotencyKey?: string): Promise<Response>
```
**Parameters:**
- `cfg: StripeConfig`
- `path: string`
- `form: URLSearchParams`
- `idempotencyKey: string` (optional)
**Returns:** `Promise<Response>`

### `stripeGet`
`@suluk/billing` — Stripe plumbing over an injected config (C046). The transport + customer/intent creation + the
saved-card surface (v1), plus the money-MOVING paths (hosted Checkout, portal, on-default-card top-up, off-session
charge), the pricing-woven subscription logic made generic over a SubPlan catalog, the Stripe Tax mechanics, and the
package-owned billing-account store (v2). Ported with the source's `res.ok`/field semantics verbatim; the Effect-Schema
defensive decode is dropped (plain typed JSON access → no `effect` dep). STAYS APP (policy, not library): the Stripe
WEBHOOK dispatch (composes @suluk/stripe webhookRouter + these primitives + @suluk/credits.grantOnce), the branded
email templates, payment-alert kinds, and refund/subscription-pooling (operator-excluded from the start).
```ts
stripeGet(cfg: StripeConfig, path: string): Promise<Response>
```
**Parameters:**
- `cfg: StripeConfig`
- `path: string`
**Returns:** `Promise<Response>`

### `toForm`
Stripe's bracket-nested `x-www-form-urlencoded` encoder: objects → `key[k]`, arrays → `key[i]`, scalars appended;
 undefined/null are skipped. Handles the nested arrays checkout/subscription payloads need (`line_items[0][price]`).
```ts
toForm(obj: Record<string, unknown>): URLSearchParams
```
**Parameters:**
- `obj: Record<string, unknown>`
**Returns:** `URLSearchParams`
