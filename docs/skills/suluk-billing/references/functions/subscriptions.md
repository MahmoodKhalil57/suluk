# Functions

## subscriptions

### `planById`
The app's plan whose id is `id`, or undefined — the generic lookup the orchestrators use against the injected catalog.
```ts
planById(plans: SubPlan[], id: string): SubPlan | undefined
```
**Parameters:**
- `plans: SubPlan[]`
- `id: string`
**Returns:** `SubPlan | undefined`

### `planByPrice`
The plan whose monthly price is exactly `priceCents` (each tier has a distinct price), or undefined — maps a live
 Stripe item price back to a plan (e.g. resolving the paid-ceiling plan).
```ts
planByPrice(plans: SubPlan[], priceCents: number): SubPlan | undefined
```
**Parameters:**
- `plans: SubPlan[]`
- `priceCents: number`
**Returns:** `SubPlan | undefined`

### `ceilingFor`
The "paid ceiling" for the CURRENT cycle = the highest plan price already CHARGED this cycle. Persisted in subscription
 metadata (raised on each above-ceiling upgrade), guarded by the period end so it auto-resets at the next renewal. Falls
 back to the current item price — a defer-change lowers the item price (for next cycle's billing) but NOT the ceiling, so
 a later change to ANY plan ≤ the ceiling stays free (you already paid for that level); only EXCEEDING it charges. PURE.
```ts
ceilingFor(metadata: Record<string, string> | undefined, periodEndSec: number, currentPriceCents: number): number
```
**Parameters:**
- `metadata: Record<string, string> | undefined`
- `periodEndSec: number`
- `currentPriceCents: number`
**Returns:** `number`

### `ensurePlanPrice`
Find (by lookup_key) or create the recurring Stripe Price for a plan. The lookup_key embeds the price + credits, so a
 repricing mints a FRESH price rather than reusing a stale one. Returns the price id.
```ts
ensurePlanPrice(cfg: StripeConfig, plan: SubPlan, branding?: SubscriptionBranding): Promise<string>
```
**Parameters:**
- `cfg: StripeConfig`
- `plan: SubPlan`
- `branding: SubscriptionBranding` (optional)
**Returns:** `Promise<string>`

### `createSubscriptionOnDefaultCard`
Create a subscription ON the saved default card (one-click). payment_behavior=default_incomplete leaves the first
 invoice unpaid with a PaymentIntent the browser confirms (confirmCardPayment → 3DS in-page) → the subscription
 activates → invoice.paid grants the cycle's credits. Returns the first invoice's client secret + the subscription id,
 or null when there's no default card.
```ts
createSubscriptionOnDefaultCard(cfg: StripeConfig, customerId: string, plan: SubPlan, userId: string, branding?: SubscriptionBranding): Promise<{ clientSecret: string; subscriptionId: string } | null>
```
**Parameters:**
- `cfg: StripeConfig`
- `customerId: string`
- `plan: SubPlan`
- `userId: string`
- `branding: SubscriptionBranding` (optional)
**Returns:** `Promise<{ clientSecret: string; subscriptionId: string } | null>`

### `getSubscriptionStatus`
```ts
getSubscriptionStatus(cfg: StripeConfig, subscriptionId: string, plans: SubPlan[]): Promise<SubscriptionStatus | null>
```
**Parameters:**
- `cfg: StripeConfig`
- `subscriptionId: string`
- `plans: SubPlan[]`
**Returns:** `Promise<SubscriptionStatus | null>`

### `changeSubscriptionPlan`
```ts
changeSubscriptionPlan(cfg: StripeConfig, subscriptionId: string, newPlan: SubPlan, userId: string, plans: SubPlan[], branding?: SubscriptionBranding): Promise<ChangePlanResult>
```
**Parameters:**
- `cfg: StripeConfig`
- `subscriptionId: string`
- `newPlan: SubPlan`
- `userId: string`
- `plans: SubPlan[]`
- `branding: SubscriptionBranding` (optional)
**Returns:** `Promise<ChangePlanResult>`
