# Types & Enums

## pricing

### `CartLine`
One cart line. `unitCents` is the authoritative price (from the server, not the client).
**Properties:**
- `unitCents: number`
- `qty: number`
- `id: string | number` (optional)

### `Discount`
A discount's MATH shape (the structural part; app-side eligibility rules are separate).
**Properties:**
- `type: "percent" | "fixed"`
- `value: number` — percent: 0–100; fixed: cents off the subtotal.
- `minSubtotalCents: number` (optional) — the discount only applies at/above this subtotal (cents).
- `maxDiscountCents: number` (optional) — cap the amount removed (cents) — e.g. "30% off, up to $50". Applied before the [0, subtotal] clamp.

### `DiscountResult`
**Properties:**
- `valid: boolean`
- `amountCents: number`
- `reason: DiscountRejection` (optional)

### `DiscountRejection`
```ts
"no-discount" | "non-positive-value" | "percent-out-of-range" | "below-minimum"
```

### `OrderTotal`
**Properties:**
- `subtotalCents: number`
- `discountCents: number`
- `totalCents: number`

### `OrderTotalFull`
The full order total once shipping + tax (from the ./shipping + ./tax adapters) are known.
**Properties:**
- `subtotalCents: number`
- `discountCents: number`
- `shippingCents: number`
- `taxCents: number`
- `totalCents: number`

### `AmountVerdict`
**Properties:**
- `ok: boolean`
- `expectedCents: number`
- `claimedCents: number`
- `deltaCents: number`
- `reason: "amount-mismatch"` (optional)

## stripe-webhook

### `StripeWebhookEvent`
A verified webhook event — only `type` is required (the router dispatches on it); `data` carries the payload.
**Properties:**
- `type: string`
- `data: unknown` (optional)

### `WebhookHandler`
```ts
(event: StripeWebhookEvent) => void | Promise<void>
```

### `WebhookRouter`

### `HandleResult`
**Properties:**
- `type: string`
- `handled: boolean` — a registered handler ran (false ⇒ the unhandled fallback ran, or nothing matched).
