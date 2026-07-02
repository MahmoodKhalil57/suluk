# Functions

## pricing

### `subtotal`
Subtotal in cents — integer, non-negative.
```ts
subtotal(lines: CartLine[]): number
```
**Parameters:**
- `lines: CartLine[]`
**Returns:** `number`

### `computeDiscountAmount`
The cents a discount removes from `subtotalCents` — ROUNDED to a whole cent and CLAMPED to [0, subtotal] so a
discount can never exceed the order or go negative. Validation (eligibility) is `validateDiscount`; this is the
raw amount assuming the discount applies.
```ts
computeDiscountAmount(subtotalCents: number, d: Discount): number
```
**Parameters:**
- `subtotalCents: number`
- `d: Discount`
**Returns:** `number`

### `validateDiscount`
Validate a discount against a subtotal, with a SPECIFIC rejection reason (PARITY: "specific discount-rejection
reasons" — a shopper is told *why*, not just "invalid"). Structural only; the app layers active/window/usage.
```ts
validateDiscount(subtotalCents: number, d: Discount | null | undefined): DiscountResult
```
**Parameters:**
- `subtotalCents: number`
- `d: Discount | null | undefined`
**Returns:** `DiscountResult`

### `prorateDiscount`
Split `discountCents` across `lines` proportionally to each line's total, as whole cents that sum EXACTLY to
`discountCents` (largest-remainder apportionment). This is what keeps the cart drawer and the order summary
from disagreeing by a cent. Each line's share is clamped to its own total.
```ts
prorateDiscount(lines: CartLine[], discountCents: number): number[]
```
**Parameters:**
- `lines: CartLine[]`
- `discountCents: number`
**Returns:** `number[]`

### `orderTotal`
Compose the authoritative order total from lines + an optional (already-validated) discount.
```ts
orderTotal(lines: CartLine[], discount?: Discount | null): OrderTotal
```
**Parameters:**
- `lines: CartLine[]`
- `discount: Discount | null` (optional)
**Returns:** `OrderTotal`

### `composeTotal`
Fold every component into ONE authoritative total: subtotal − discount + shipping + tax, each a non-negative whole
cent and the discount never exceeding the subtotal. The single place the order total is composed once shipping (a
ShippingOption) and tax (a TaxResult) are resolved — so the cart drawer, checkout summary, order record, and the
Stripe charge can never disagree.
```ts
composeTotal(parts: { subtotalCents: number; discountCents?: number; shippingCents?: number; taxCents?: number }): OrderTotalFull
```
**Parameters:**
- `parts: { subtotalCents: number; discountCents?: number; shippingCents?: number; taxCents?: number }`
**Returns:** `OrderTotalFull`

### `verifyAmount`
ANTI-TAMPERING: recompute the total from authoritative line prices + the discount and compare it to the amount
the client claims (e.g. a PaymentIntent amount the browser posted). Reject any mismatch beyond `toleranceCents`
(default 0 — money is exact). The server must call this before honoring any client-supplied amount.
```ts
verifyAmount(lines: CartLine[], discount: Discount | null | undefined, claimedCents: number, opts: { toleranceCents?: number }): AmountVerdict
```
**Parameters:**
- `lines: CartLine[]`
- `discount: Discount | null | undefined`
- `claimedCents: number`
- `opts: { toleranceCents?: number }` — default: `{}`
**Returns:** `AmountVerdict`

### `cartFingerprint`
A stable fingerprint of the priced cart (+ discount) — order-independent over lines. Two carts that should be
charged identically produce the same fingerprint; any price/qty/discount change produces a different one.
```ts
cartFingerprint(lines: CartLine[], discount?: Discount | null): string
```
**Parameters:**
- `lines: CartLine[]`
- `discount: Discount | null` (optional)
**Returns:** `string`

### `idempotencyKey`
A deterministic idempotency key for a checkout attempt. The SAME cart under the same scope (principal) yields
the SAME key, so a retried "create payment intent" REUSES the existing intent instead of charging twice; a
changed cart yields a new key. Thread this into the processor's idempotency-key header.
```ts
idempotencyKey(scope: string, lines: CartLine[], discount?: Discount | null): string
```
**Parameters:**
- `scope: string`
- `lines: CartLine[]`
- `discount: Discount | null` (optional)
**Returns:** `string`

### `requiresStripe`
Does this total require a real Stripe charge, or can it complete as a free order? Centralizes the $0.50 floor
 decision so the free-checkout branch and the Stripe branch can never disagree about where $0–$0.49 goes.
```ts
requiresStripe(totalCents: number): boolean
```
**Parameters:**
- `totalCents: number`
**Returns:** `boolean`

## stripe-webhook

### `verifyStripeSignature`
Verify a Stripe `stripe-signature` header against the raw request body + the endpoint signing secret. Returns true iff
a v1 signature matches the HMAC of `${t}.${rawBody}` AND the timestamp is within tolerance. Pass the RAW (unparsed)
body — re-serializing JSON changes the bytes and breaks the HMAC.
```ts
verifyStripeSignature(rawBody: string, sigHeader: string, secret: string, opts: VerifyOptions): Promise<boolean>
```
**Parameters:**
- `rawBody: string`
- `sigHeader: string`
- `secret: string`
- `opts: VerifyOptions` — default: `{}`
**Returns:** `Promise<boolean>`

### `timingSafeHexEqual`
Constant-time hex-string compare (no early-out) — guards the signature check against timing oracles.
```ts
timingSafeHexEqual(a: string, b: string): boolean
```
**Parameters:**
- `a: string`
- `b: string`
**Returns:** `boolean`

### `webhookRouter`
Build a router, optionally seeded with a `{ type → handler }` map.
```ts
webhookRouter(handlers: Record<string, WebhookHandler>): WebhookRouter
```
**Parameters:**
- `handlers: Record<string, WebhookHandler>` — default: `{}`
**Returns:** `WebhookRouter`

## stripe-transport

### `toForm`
Stripe's bracket-nested `x-www-form-urlencoded` encoder: objects → `key[k]`, arrays → `key[i]`, scalars appended;
 undefined/null are skipped. Handles the nested arrays checkout/subscription payloads need (`line_items[0][price]`).
```ts
toForm(obj: Record<string, unknown>): URLSearchParams
```
**Parameters:**
- `obj: Record<string, unknown>`
**Returns:** `URLSearchParams`

### `stripePost`
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
```ts
stripeGet(cfg: StripeConfig, path: string): Promise<Response>
```
**Parameters:**
- `cfg: StripeConfig`
- `path: string`
**Returns:** `Promise<Response>`
