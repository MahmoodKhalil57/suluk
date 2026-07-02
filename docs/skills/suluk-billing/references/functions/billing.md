# Functions

## billing

### `createCustomer`
Create a Stripe customer for the user (the caller persists the id). Routed through @suluk/payments (C048) — the
 processor is swappable; the Stripe request (POST /customers with email + metadata[userId]) is unchanged.
```ts
createCustomer(cfg: StripeConfig, email: string | null, userId: string): Promise<string>
```
**Parameters:**
- `cfg: StripeConfig`
- `email: string | null`
- `userId: string`
**Returns:** `Promise<string>`

### `createSetupIntent`
Create a $0 SetupIntent to vault a card without charging ("Add card"). Returns the client secret.
```ts
createSetupIntent(cfg: StripeConfig, customerId: string, userId: string): Promise<string>
```
**Parameters:**
- `cfg: StripeConfig`
- `customerId: string`
- `userId: string`
**Returns:** `Promise<string>`

### `createPaymentIntent`
Create a PaymentIntent for an on-site one-time top-up (saves the card; the webhook credits it). Returns the client secret.
```ts
createPaymentIntent(cfg: StripeConfig, customerId: string, amountCents: number, meta: { userId: string; credits: number; taxCalculation?: string | null }): Promise<string>
```
**Parameters:**
- `cfg: StripeConfig`
- `customerId: string`
- `amountCents: number`
- `meta: { userId: string; credits: number; taxCalculation?: string | null }`
**Returns:** `Promise<string>`

### `listPaymentMethods`
List a customer's saved cards (each with its billing address), marking the invoice default.
```ts
listPaymentMethods(cfg: StripeConfig, customerId: string): Promise<PaymentMethodWire[]>
```
**Parameters:**
- `cfg: StripeConfig`
- `customerId: string`
**Returns:** `Promise<PaymentMethodWire[]>`

### `defaultCard`
The customer's DEFAULT saved card — its id (to charge) + its billing address (to locate tax). Graceful: a transient
 Stripe error returns null rather than blocking a top-up (this is only tax LOCATION / an off-session skip).
```ts
defaultCard(cfg: StripeConfig, customerId: string): Promise<{ pmId: string; address: TaxAddress | null } | null>
```
**Parameters:**
- `cfg: StripeConfig`
- `customerId: string`
**Returns:** `Promise<{ pmId: string; address: TaxAddress | null } | null>`

### `defaultPaymentMethodId`
The customer's default payment-method id (to charge off-session), or null.
```ts
defaultPaymentMethodId(cfg: StripeConfig, customerId: string): Promise<string | null>
```
**Parameters:**
- `cfg: StripeConfig`
- `customerId: string`
**Returns:** `Promise<string | null>`

### `ownsPaymentMethod`
Whether `pmId` belongs to `customerId` — guards set-default / detach against another customer's card.
```ts
ownsPaymentMethod(cfg: StripeConfig, customerId: string, pmId: string): Promise<boolean>
```
**Parameters:**
- `cfg: StripeConfig`
- `customerId: string`
- `pmId: string`
**Returns:** `Promise<boolean>`

### `setDefaultPaymentMethod`
Make `pmId` the customer's default payment method for invoices.
```ts
setDefaultPaymentMethod(cfg: StripeConfig, customerId: string, pmId: string): Promise<void>
```
**Parameters:**
- `cfg: StripeConfig`
- `customerId: string`
- `pmId: string`
**Returns:** `Promise<void>`

### `setSubscriptionDefaultCard`
Point an ACTIVE subscription at `pmId` too, so changing the default card moves the recurring charge to it.
```ts
setSubscriptionDefaultCard(cfg: StripeConfig, subscriptionId: string, pmId: string): Promise<void>
```
**Parameters:**
- `cfg: StripeConfig`
- `subscriptionId: string`
- `pmId: string`
**Returns:** `Promise<void>`

### `detachPaymentMethod`
Detach (remove) a saved card from the customer.
```ts
detachPaymentMethod(cfg: StripeConfig, pmId: string): Promise<void>
```
**Parameters:**
- `cfg: StripeConfig`
- `pmId: string`
**Returns:** `Promise<void>`

### `setSubscriptionCancel`
Schedule the subscription to cancel at the period end (`cancel=true`) or resume it (`cancel=false`).
```ts
setSubscriptionCancel(cfg: StripeConfig, subscriptionId: string, cancel: boolean): Promise<void>
```
**Parameters:**
- `cfg: StripeConfig`
- `subscriptionId: string`
- `cancel: boolean`
**Returns:** `Promise<void>`

### `payOpenInvoice`
Best-effort: if the subscription's latest invoice is still OPEN (a failed renewal), retry it NOW. No-op when there's
 nothing open to pay; never throws (a fix-billing flow must not 500 on the retry).
```ts
payOpenInvoice(cfg: StripeConfig, subscriptionId: string): Promise<void>
```
**Parameters:**
- `cfg: StripeConfig`
- `subscriptionId: string`
**Returns:** `Promise<void>`
