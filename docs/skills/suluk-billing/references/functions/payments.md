# Functions

## payments

### `createCheckout`
Create a Stripe Checkout Session (one-time top-up) — the hosted FALLBACK to the on-site Payment Element. Reuses the
 user's existing customer or has Checkout create one, captures the billing address, and saves the card for future
 off-session use. Returns the hosted checkout URL.
```ts
createCheckout(cfg: StripeConfig, o: CheckoutOpts): Promise<string>
```
**Parameters:**
- `cfg: StripeConfig`
- `o: CheckoutOpts`
**Returns:** `Promise<string>`

### `createSubscriptionCheckout`
Stripe Checkout in SUBSCRIPTION mode (recurring). subscription_data.metadata carries who + how many credits/cycle.
```ts
createSubscriptionCheckout(cfg: StripeConfig, o: SubscriptionCheckoutOpts): Promise<string>
```
**Parameters:**
- `cfg: StripeConfig`
- `o: SubscriptionCheckoutOpts`
**Returns:** `Promise<string>`

### `createPortalSessionForCustomer`
Open the Stripe billing portal (manage/cancel) for an existing customer. Returns the URL; throws on a Stripe error.
```ts
createPortalSessionForCustomer(cfg: StripeConfig, customerId: string, returnUrl: string): Promise<string>
```
**Parameters:**
- `cfg: StripeConfig`
- `customerId: string`
- `returnUrl: string`
**Returns:** `Promise<string>`

### `createPaymentIntentOnDefaultCard`
Create a PaymentIntent on the customer's SAVED DEFAULT card — the one-click top-up path. The server resolves the
 default payment method (client can't inject one), pins the PI to it, and returns the client secret; the browser
 confirms (3DS in-page if needed). Returns null when there's no default card to charge. No setup_future_usage — the
 card is already saved.
```ts
createPaymentIntentOnDefaultCard(cfg: StripeConfig, customerId: string, amountCents: number, meta: TopupMeta): Promise<string | null>
```
**Parameters:**
- `cfg: StripeConfig`
- `customerId: string`
- `amountCents: number`
- `meta: TopupMeta`
**Returns:** `Promise<string | null>`

### `chargeOffSession`
An OFF-SESSION charge on a saved card (auto-top-up). Confirms immediately; metadata carries who + credits + `source`
 so the payment_intent.succeeded webhook credits idempotently on the SAME `pi:<id>` key. Returns the PaymentIntent id +
 status, plus `authRequired` when the card needs 3DS (a decline to NOTIFY, not throw on). A hard 402 card decline is
 also returned (not thrown) so the caller can alert; a transient/transport failure throws (it may recover).
```ts
chargeOffSession(cfg: StripeConfig, customerId: string, pmId: string, amountCents: number, meta: TopupMeta): Promise<{ id: string | null; status: string | null; authRequired: boolean }>
```
**Parameters:**
- `cfg: StripeConfig`
- `customerId: string`
- `pmId: string`
- `amountCents: number`
- `meta: TopupMeta`
**Returns:** `Promise<{ id: string | null; status: string | null; authRequired: boolean }>`
