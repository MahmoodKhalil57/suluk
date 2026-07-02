# Functions

## billing.pricing

### `stripeCutCents`
The ACTUAL Stripe cut on a charge of `chargeCents`, in cents — `ceil` so we never under-estimate what Stripe keeps.
```ts
stripeCutCents(chargeCents: number): number
```
**Parameters:**
- `chargeCents: number`
**Returns:** `number`

### `creditsForCharge`
The ONE "pay X → get Y credits" function behind every acquisition path (top-up, pack, subscription): credits a
`chargeCents` payment buys at `perCreditMicroUsd`, AFTER netting Stripe's cut. Y bakes in COGS + markup + the tier
discount (all in the rate) and the processing fee (the netting). Tax, when enabled, stays a SEPARATE on-top line.
```ts
creditsForCharge(chargeCents: number, perCreditMicroUsd: number): number
```
**Parameters:**
- `chargeCents: number`
- `perCreditMicroUsd: number`
**Returns:** `number`

### `creditsForUsd`
Credits a CUSTOM one-time USD charge buys (the "Add credits" dialog), at the retail rate, net of Stripe's cut. Server-authoritative.
```ts
creditsForUsd(cents: number): number
```
**Parameters:**
- `cents: number`
**Returns:** `number`

### `packById`
```ts
packById(id: string): CreditPack | undefined
```
**Parameters:**
- `id: string`
**Returns:** `CreditPack | undefined`

### `subPlanById`
```ts
subPlanById(id: string): any
```
**Parameters:**
- `id: string`
**Returns:** `any`

### `subPlanByPrice`
The plan whose monthly price is exactly `priceCents` (each tier has a distinct price), or undefined — maps a live
 Stripe item price back to a plan.
```ts
subPlanByPrice(priceCents: number): any
```
**Parameters:**
- `priceCents: number`
**Returns:** `any`

### `refundGrossCents`
Gross buyback value (cents) for `credits` at the refund rate, BEFORE the Stripe fee.
```ts
refundGrossCents(credits: number): number
```
**Parameters:**
- `credits: number`
**Returns:** `number`

### `refundNetCents`
Net cash refunded (cents): the gross buyback minus the Stripe cut the user eats on the payout, floored at 0.
```ts
refundNetCents(credits: number): number
```
**Parameters:**
- `credits: number`
**Returns:** `number`

## billing.service

### `autoTopupClaimWhere`
```ts
autoTopupClaimWhere(userId: string, cutoff: Date): any
```
**Parameters:**
- `userId: string`
- `cutoff: Date`
**Returns:** `any`

## billing.routes

### `billingRoutes`
```ts
billingRoutes(): any
```
**Returns:** `any`
