# Variables & Constants

## billing.pricing

### `CREDIT_COGS_MICROUSD`
```ts
const CREDIT_COGS_MICROUSD: 450
```

### `MARKUP_PCT`
```ts
const MARKUP_PCT: 73
```

### `creditPriceMicroUsd`
Retail price per credit (µ$) = COGS marked up — what a one-time top-up pays.
```ts
const creditPriceMicroUsd: number
```

### `SUB_TIER_DISCOUNT`
```ts
const SUB_TIER_DISCOUNT: Record<string, number>
```

### `subCreditPriceMicroUsd`
The LOWEST subscriber per-credit price (the deepest tier discount) — the conservative value the ≥COGS audit checks.
```ts
const subCreditPriceMicroUsd: number
```

### `PROVIDER_FEE_PCT`
```ts
const PROVIDER_FEE_PCT: 0.029
```

### `PROVIDER_FEE_FLAT_CENTS`
```ts
const PROVIDER_FEE_FLAT_CENTS: 30
```

### `CREDIT_PACKS`
One-time top-up packs (round prices; credits derived from the marked-up COGS).
```ts
const CREDIT_PACKS: CreditPack[]
```

### `SUB_PLANS`
Recurring subscription plans (3 monthly tiers; round prices, credits derived at each tier's subsidized rate).
```ts
const SUB_PLANS: billingAccount[]
```

### `minAcquisitionPriceMicroUsd`
The CHEAPEST per-credit price across EVERY acquisition path (one-time packs at retail + each plan at its tier
 discount). The refund buyback stays strictly below this, so buying credits then refunding them can never profit.
```ts
const minAcquisitionPriceMicroUsd: number
```

### `REFUND_HAIRCUT_PCT`
```ts
const REFUND_HAIRCUT_PCT: 0.2
```

### `refundCreditPriceMicroUsd`
```ts
const refundCreditPriceMicroUsd: number
```

## billing.service

### `BillingLive`
```ts
const BillingLive: any
```

## billing.schema

### `autoTopup`
The user's off-session auto-recharge config — MODULE-OWNED (auto-topup is app POLICY, excluded from @suluk/billing).
 `lastTriggeredAt` is the CAS anchor the trigger flips so two concurrent debits can't double-charge (see the routes).
```ts
const autoTopup: any
```

### `paymentAlert`
A standing payment-health flag surfaced in the billing UI (a declined renewal / auto-top-up / 3DS-needed) — MODULE-OWNED
 (alert kinds are app POLICY). Append-only; the app clears a user's alerts on a successful charge.
```ts
const paymentAlert: any
```

### `billingAccount`
```ts
let billingAccount: any
```

## billing.provision

### `billingProvision`
```ts
const billingProvision: billingAccount[]
```

## billing.contract

### `billingOps`
```ts
const billingOps: ({ method: string; path: string; name: string; summary: string; tags: string[]; responses: { status: number; description: string }[]; scopes?: undefined; request?: undefined; errors?: undefined } | { method: string; path: string; name: string; summary: string; tags: string[]; scopes: string[]; responses: { status: number; description: string }[]; request?: undefined; errors?: undefined } | { method: string; path: string; name: string; summary: string; tags: string[]; scopes: string[]; request: { json: ZodObject<{ packId: ZodString; successUrl: ZodString; cancelUrl: ZodString }, "strip", ZodTypeAny, { packId: string; successUrl: string; cancelUrl: string }, { packId: string; successUrl: string; cancelUrl: string }> }; responses: { status: number; description: string }[]; errors?: undefined } | { method: string; path: string; name: string; summary: string; tags: string[]; scopes: string[]; errors: number[]; request: { json: ZodObject<{ planId: ZodString; hosted: ZodOptional<ZodBoolean>; successUrl: ZodOptional<ZodString>; cancelUrl: ZodOptional<ZodString> }, "strip", ZodTypeAny, { planId: string; successUrl?: string; cancelUrl?: string; hosted?: boolean }, { planId: string; successUrl?: string; cancelUrl?: string; hosted?: boolean }> }; responses: { status: number; description: string }[] } | { method: string; path: string; name: string; summary: string; tags: string[]; scopes: string[]; errors: number[]; responses: { status: number; description: string }[]; request?: undefined })[]
```
