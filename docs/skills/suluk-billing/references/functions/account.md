# Functions

## account

### `billingCustomerId`
The user's Stripe customer id, or null when they have no billing account yet.
```ts
billingCustomerId(db: BillingDB, userId: string): Promise<string | null>
```
**Parameters:**
- `db: BillingDB`
- `userId: string`
**Returns:** `Promise<string | null>`

### `billingSubscriptionId`
The user's recorded Stripe subscription id, or null when they have no subscription.
```ts
billingSubscriptionId(db: BillingDB, userId: string): Promise<string | null>
```
**Parameters:**
- `db: BillingDB`
- `userId: string`
**Returns:** `Promise<string | null>`

### `linkBillingCustomer`
Persist the user's Stripe customer id WITHOUT touching subscriptionId — so a one-time top-up never clears a
 subscriber's `subscriptionId` (unlike upsertBillingAccount, which sets it). Idempotent on the userId PK.
```ts
linkBillingCustomer(db: BillingDB, userId: string, customerId: string): Promise<void>
```
**Parameters:**
- `db: BillingDB`
- `userId: string`
- `customerId: string`
**Returns:** `Promise<void>`

### `upsertBillingAccount`
Persist customer + subscription together (the subscribe path sets both). Idempotent on the userId PK.
```ts
upsertBillingAccount(db: BillingDB, userId: string, customerId: string, subscriptionId: string | null): Promise<void>
```
**Parameters:**
- `db: BillingDB`
- `userId: string`
- `customerId: string`
- `subscriptionId: string | null`
**Returns:** `Promise<void>`

### `clearSubscription`
Clear the recorded subscription (on customer.subscription.deleted) — leaves the customer id (+ its saved card) intact.
```ts
clearSubscription(db: BillingDB, userId: string): Promise<void>
```
**Parameters:**
- `db: BillingDB`
- `userId: string`
**Returns:** `Promise<void>`
