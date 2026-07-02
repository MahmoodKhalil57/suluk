# Types & Enums

## types

### `Secret`
A processor-side secret / PII value — wrapped so it's explicit at every call site and never accidentally logged.

### `Currency`
ISO-4217 currency. A curated set for `Currency.USD`-style access; open to any code a connector accepts.
```ts
typeof Currency[keyof typeof Currency] | string & {}
```

### `MinorAmount`
An amount in the currency's minor unit (cents), the Prism convention (no floats in the money path).
**Properties:**
- `minorAmount: number`
- `currency: Currency`

### `CardDetails`
**Properties:**
- `cardNumber: Secret`
- `cardExpMonth: Secret`
- `cardExpYear: Secret`
- `cardCvc: Secret`
- `cardHolderName: Secret<string>` (optional)

### `PaymentMethod`
The payment instrument. Extend with wallet / bank-transfer as connectors gain coverage; card + token are the core.
 `token` is a saved/vaulted instrument id (the app's or the processor's vault — the library stores nothing).
**Properties:**
- `card: CardDetails` (optional)
- `token: Secret<string>` (optional)

### `Address`
**Properties:**
- `line1: string` (optional)
- `line2: string` (optional)
- `city: string` (optional)
- `state: string` (optional)
- `postalCode: string` (optional)
- `country: string` (optional)

### `OrderDetail`
**Properties:**
- `description: string`
- `quantity: number` (optional)
- `amount: number` (optional)

### `PaymentError`
A structured error the library surfaces (in-band on FAILURE, or on a thrown IntegrationError/ConnectorError). Only
 primitive fields — never a processor's raw object (which may not be serializable).
**Properties:**
- `message: string` (optional)
- `code: string` (optional)
- `reason: string` (optional)

### `RedirectionData`
Where to send the customer for 3DS / redirect flows (present when status is AUTHENTICATION_PENDING).
**Properties:**
- `url: string` (optional)
- `method: "GET" | "POST"` (optional)
- `fields: Record<string, string>` (optional)

### `AuthorizeRequest`
**Properties:**
- `merchantTransactionId: string`
- `amount: MinorAmount`
- `captureMethod: CaptureMethod`
- `paymentMethod: PaymentMethod`
- `authType: AuthenticationType`
- `address: Address` (optional)
- `returnUrl: string` (optional)
- `orderDetails: OrderDetail[]` (optional)
- `customerId: string` (optional) — an existing processor customer to attach the charge to (optional).
- `setupFutureUsage: boolean` (optional) — save the instrument for later off-session use (recurring / one-click).
- `offSession: boolean` (optional) — the charge is happening WITHOUT the cardholder present (auto top-up / recurring) — the processor may decline for
 3DS (`AUTHENTICATION_PENDING`) rather than charge. Maps to Stripe `off_session`, Adyen `ContAuth`, etc.
- `metadata: Record<string, string>` (optional) — free-form key/value the processor stores + echoes on its webhook (e.g. `{ userId, credits }` the crediting path
 reads). Most processors support it (Stripe metadata, Adyen additionalData).
- `testMode: boolean` (optional)

### `PaymentResponse`
**Properties:**
- `status: PaymentStatus`
- `connectorTransactionId: string` (optional)
- `redirectionData: RedirectionData` (optional)
- `error: PaymentError` (optional)
- `amount: MinorAmount` (optional) — the amount actually captured/authorized, when the processor reports it.

### `CaptureRequest`
**Properties:**
- `merchantCaptureId: string`
- `connectorTransactionId: string`
- `amountToCapture: MinorAmount`
- `testMode: boolean` (optional)

### `VoidRequest`
**Properties:**
- `merchantVoidId: string`
- `connectorTransactionId: string`
- `cancellationReason: string` (optional)
- `testMode: boolean` (optional)

### `RefundRequest`
**Properties:**
- `merchantRefundId: string`
- `connectorTransactionId: string`
- `refundAmount: MinorAmount`
- `paymentAmount: number` — the ORIGINAL payment amount (minor units) — some processors require it to compute a partial refund.
- `reason: string` (optional)
- `testMode: boolean` (optional)

### `RefundResponse`
**Properties:**
- `status: RefundStatus`
- `connectorRefundId: string` (optional)
- `error: PaymentError` (optional)

### `SyncRequest`
**Properties:**
- `connectorTransactionId: string`
- `testMode: boolean` (optional)

### `ClientSession`
A browser-confirmable session: the server creates the intent, the browser SDK confirms it with `clientSecret`, so raw
card data never touches the server (PCI-scope reduction). Crediting lands on the processor webhook, not the create
call. This is the piece a pure server-side `authorize` can't express — the Payment-Element / one-click / add-card flows.
**Properties:**
- `clientSecret: string` — the token the browser SDK confirms with — Stripe's `client_secret`; another processor's equivalent.
- `connectorTransactionId: string` (optional)
- `customerId: string` (optional)

### `CreatePaymentSessionRequest`
Create a PAYMENT session to confirm in-browser. Omit `paymentMethod` for a Payment-Element flow (the browser collects
 the card); pass a saved `paymentMethod` token for a one-click charge on a saved card.
**Properties:**
- `amount: MinorAmount`
- `customerId: string` (optional)
- `paymentMethod: Secret<string>` (optional) — pin the charge to a saved instrument (one-click); omit to let the browser collect one (Payment Element).
- `captureMethod: CaptureMethod` (optional)
- `setupFutureUsage: boolean` (optional) — save the collected card for later off-session use.
- `metadata: Record<string, string>` (optional)

### `CreateSetupSessionRequest`
Create a SETUP session to vault a card without charging ("add card").
**Properties:**
- `customerId: string`
- `metadata: Record<string, string>` (optional)

### `CaptureMethod`
Auto-capture on authorize, or authorize-then-capture-later.
- `AUTOMATIC` = `"AUTOMATIC"`
- `MANUAL` = `"MANUAL"`

### `AuthenticationType`
3-D Secure preference.
- `NO_THREE_DS` = `"NO_THREE_DS"`
- `THREE_DS` = `"THREE_DS"`

### `PaymentStatus`
Payment status — INTEGER values mirroring Prism exactly (do NOT renumber; a real Prism backend + connector code depend
on these). A soft decline is `FAILURE` returned IN-BAND on the response (never thrown). Use with authorize/capture/void.
- `UNSPECIFIED` = `0`
- `STARTED` = `1`
- `AUTHENTICATION_FAILED` = `2`
- `ROUTER_DECLINED` = `3`
- `AUTHENTICATION_PENDING` = `4`
- `AUTHENTICATION_SUCCESSFUL` = `5`
- `AUTHORIZED` = `6`
- `AUTHORIZATION_FAILED` = `7`
- `CHARGED` = `8`
- `VOIDED` = `11`
- `VOID_INITIATED` = `12`
- `CAPTURE_INITIATED` = `13`
- `CAPTURE_FAILED` = `14`
- `VOID_FAILED` = `15`
- `PARTIAL_CHARGED` = `17`
- `UNRESOLVED` = `19`
- `PENDING` = `20`
- `FAILURE` = `21`
- `PARTIALLY_AUTHORIZED` = `25`
- `EXPIRED` = `26`

### `RefundStatus`
Refund status — a SEPARATE enum from PaymentStatus with overlapping integers (mirrors Prism). `REFUND_PENDING`
 is a normal success state for many processors — treat PENDING + SUCCESS both as success.
- `UNSPECIFIED` = `0`
- `REFUND_FAILURE` = `1`
- `REFUND_MANUAL_REVIEW` = `2`
- `REFUND_PENDING` = `3`
- `REFUND_SUCCESS` = `4`
- `REFUND_TRANSACTION_FAILURE` = `5`

## connector

### `PaymentConnector`
A payment processor behind the unified schema. The CORE flows (authorize/capture/void/refund/sync) are required; the
advanced surfaces (customer, tokenize/vault, recurring, webhook) are OPTIONAL — a connector declares them as it gains
coverage, and the caller feature-detects. A soft decline is returned as `status: FAILURE`, never thrown.
**Properties:**
- `name: string` — the processor id, e.g. "stripe".

### `ConnectorAuth`
A connector's typed credentials (per processor). `Secret`-wrapped so keys aren't logged.
```ts
Record<string, Secret | undefined>
```

### `ConnectorFactory`
Builds a connector from its typed auth + http options — what each processor module exports.
```ts
(auth: ConnectorAuth, http?: HttpOptions) => PaymentConnector
```

### `ConnectorRegistry`
The connector registry: processor id → factory. The app composes it from the connector modules it ships.
```ts
Record<string, ConnectorFactory>
```

### `WebhookEvent`
A normalized webhook event (the unified shape a connector's handleWebhook produces).
**Properties:**
- `type: string`
- `connectorTransactionId: string` (optional)
- `status: number` (optional)
- `raw: unknown`

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
