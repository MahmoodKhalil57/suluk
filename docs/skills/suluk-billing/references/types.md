# Types & Enums

## billing

### `PaymentMethodWire`
A payment method as the billing panel shows it — card + its billing address + whether it's the customer's default.
**Properties:**
- `id: string`
- `brand: string`
- `last4: string`
- `expMonth: number`
- `expYear: number`
- `name: string | null`
- `line1: string | null`
- `line2: string | null`
- `city: string | null`
- `region: string | null`
- `postalCode: string | null`
- `country: string | null`
- `isDefault: boolean`

### `TaxAddress`
A buyer's tax location (from a saved card's billing address).
**Properties:**
- `country: string`
- `state: string | null`
- `postalCode: string | null`
- `city: string | null`
- `line1: string | null`

## payments

### `CheckoutOpts`
**Properties:**
- `userId: string`
- `customerId: string | null` — the user's existing customer (reused so a saved card isn't orphaned), or null to let Checkout create one.
- `amountCents: number`
- `credits: number`
- `successUrl: string` — the URL Stripe returns to on success (the app composes it from its origin + route).
- `cancelUrl: string`
- `productName: string` — the line-item product name shown on the hosted page, e.g. "acme — 600 credits".

### `SubscriptionCheckoutOpts`
**Properties:**
- `userId: string`
- `plan: SubPlan`
- `successUrl: string`
- `cancelUrl: string`
- `productName: string` — the line-item product name shown on the hosted page, e.g. "acme — Pro".

### `TopupMeta`
The metadata tag the webhook reads to decide whether (and how) to credit a PaymentIntent.

## tax

### `TaxResult`
**Properties:**
- `taxCents: number`
- `calculationId: string | null`

### `TaxLocation`
A buyer's tax location. The saved card's BILLING ADDRESS is preferred (precise + works off-session); the request IP is
 the fallback for a first on-session purchase where no card is saved yet.
**Properties:**
- `address: TaxAddress | null` (optional)
- `ip: string | null` (optional)

## subscriptions

### `SubPlan`
A subscription plan as the app prices it — generic shape; the app derives `priceCents`/`credits` from its COGS model.
**Properties:**
- `id: string`
- `name: string`
- `credits: number`
- `priceCents: number`
- `label: string`

### `SubscriptionBranding`
Branding seam for the Stripe Product/Price a plan creates — app-controlled so find-or-create stays stable + on-brand.
**Properties:**
- `productName: (plan: SubPlan) => string` (optional) — the recurring Price's product name; default `${plan.name} (monthly)`.
- `lookupKeyPrefix: string` (optional) — the lookup_key PREFIX that makes find-or-create idempotent across repricing; default "sub". KEEP STABLE per app.

### `SubscriptionStatus`
The user's CURRENT subscription as the UI needs it (plan + status + period end + pending-cancel + the cycle's paid
 ceiling), or null when there's no live subscription. Live state from Stripe; `plans` is the app catalog for the
 price fallback when the live item lacks one.
**Properties:**
- `planId: string | null`
- `status: string`
- `currentPeriodEnd: number`
- `cancelAtPeriodEnd: boolean`
- `paidCeilingCents: number`

### `ChangePlanResult`
Change the subscriber's plan IN PLACE against the cycle's PAID CEILING (see ceilingFor). ABOVE the ceiling = an
 upgrade: immediate + prorated for the difference ABOVE THE CEILING, charged off-session; the matching prorated credits
 land on that invoice.paid (3DS-safe). AT OR BELOW the ceiling = a deferred change: no charge + no new credits now — it
 re-prices for the NEXT renewal (so up→down→up within a cycle never re-charges). Returns the kind, the period end, and a
 clientSecret ONLY when the upgrade's prorated charge needs in-page 3DS. `plans` is the app catalog.
**Properties:**
- `kind: "upgrade" | "downgrade"`
- `clientSecret: string | null`
- `currentPeriodEnd: number`

## account

### `BillingDB`
The injected DB handle. Prod is drizzle/d1; tests bridge drizzle/bun-sqlite to this type (a runtime-identity narrow).
```ts
DrizzleD1Database
```
