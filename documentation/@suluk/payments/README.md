[**Suluk**](../../README.md)

***

[Suluk](../../packages.md) / @suluk/payments

<p align="center">
  <a href="https://github.com/MahmoodKhalil57/suluk">
    <img src="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/wordmark.png" alt="Suluk" width="360" />
  </a>
</p>

<h1 align="center">@suluk/payments</h1>

<p align="center"><b>Provider-agnostic payments for the edge — one unified request schema (authorize / capture / void / refund / sync), switch processor by config not code. A Workers-native reimplementation of the Hyperswitch Prism interface.</b></p>

<p align="center">
  <em>Part of <a href="https://github.com/MahmoodKhalil57/suluk">Suluk</a> — one typed OpenAPI v4 contract projecting into every full-stack layer.</em>
</p>

---

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```sh
bun add @suluk/payments
```

## What it does

One unified payment schema for every processor (C048). [Hyperswitch Prism](https://github.com/juspay/hyperswitch)
ships as a native FFI addon (a Rust core) that can't run in a Cloudflare Worker, so `@suluk/payments`
adopts its **interface** — a single request schema for authorize / capture / void / refund / sync,
plus optional customer / tokenize / recurring / webhook surfaces — and implements it over `fetch`:
zero native deps, edge-safe, swappable. You pass **one** `connectorConfig` naming the processor and
its credentials; switching Stripe → Adyen is a config change, not a code change.

The status enums mirror Prism's **integer** values exactly, so a real Prism backend stays a drop-in
later and connector semantics match. A soft decline is returned **in-band** as
`status: PaymentStatus.*` (e.g. `ROUTER_DECLINED`), never thrown — thrown errors are reserved for
integration/network faults. Sensitive values are wrapped in `Secret<T>` so they're explicit at every
call site and never accidentally logged.

This barrel ships the **interface** + a `mockConnector`, the first real backend (`stripeConnector`),
the processor-agnostic **pricing** primitives, and the SDK-free Stripe **webhook** surface — the
seam that supersedes `@suluk/stripe`.

## Usage

```ts
import {
  paymentClient, stripeConnector,
  CaptureMethod, AuthenticationType, Currency, PaymentStatus,
  type ConnectorConfig, type AuthorizeRequest,
} from "@suluk/payments";

// Config selects the connector — name exactly one processor + its credentials.
const config: ConnectorConfig = { connectorConfig: { stripe: { apiKey: { value: env.STRIPE_SECRET_KEY } } } };

// `registry` maps a processor name → its connector factory.
const client = paymentClient(config, { stripe: stripeConnector });

const req: AuthorizeRequest = {
  merchantTransactionId: "txn_1",
  amount: { minorAmount: 2000, currency: Currency.USD }, // integer minor units
  captureMethod: CaptureMethod.AUTOMATIC,
  authType: AuthenticationType.NO_THREE_DS,
  paymentMethod: { card: {
    cardNumber: { value: "4242424242424242" }, cardExpMonth: { value: "12" },
    cardExpYear: { value: "2030" }, cardCvc: { value: "123" },
  } },
};

const res = await client.authorize(req);
res.status;                 // PaymentStatus.CHARGED — a soft decline is a status, never a throw
res.connectorTransactionId; // "pi_..." — carry it into capture/void/refund/sync

// Later: refund part of the charge.
await client.refund({
  merchantRefundId: "r1",
  connectorTransactionId: res.connectorTransactionId,
  refundAmount: { minorAmount: 500, currency: Currency.USD },
  paymentAmount: 2000,
});
```

The transport seam is mockable — pass `{ fetch }` as the third arg to `paymentClient` (or use
`mockConnector` with `MOCK_DECLINE_CARD` / `MOCK_3DS_CARD`) to test the whole flow with no live
processor.

## What's inside

| Export | What it does |
| --- | --- |
| `paymentClient(config, registry, http?)` | Resolve the config-named processor to a bound `PaymentConnector`. |
| `PaymentConnector` (interface) | The unified surface every processor implements (core flows required; advanced optional). |
| `stripeConnector` | The first real backend — `fetch` → Stripe REST, Workers-native. |
| `mockConnector`, `MOCK_DECLINE_CARD`, `MOCK_3DS_CARD` | An in-memory connector + fixtures for tests. |
| `IntegrationError` / `ConnectorError` / `NetworkError` / `PaymentLibError` | The thrown error taxonomy (a soft decline is a *status*, not an error). |
| `subtotal`, `orderTotal`, `composeTotal`, `computeDiscountAmount`, `validateDiscount`, `prorateDiscount`, `verifyAmount`, `cartFingerprint`, `idempotencyKey`, … | Processor-agnostic **pricing** math (anti-tampering, proration, checkout totals). |
| `verifyStripeSignature`, `timingSafeHexEqual`, `webhookRouter`, `STRIPE_EVENTS` | SDK-free Stripe **webhook** verification + a typed event router. |
| `stripePost` / `stripeGet` / `toForm` (`stripe-transport`) | The low-level one-client Stripe transport for platform ops the agnostic seam doesn't model. |

The type vocabulary (`AuthorizeRequest`, `PaymentResponse`, `RefundRequest`, `MinorAmount`, `Secret`,
`Currency`, `CaptureMethod`, `AuthenticationType`, `PaymentStatus`, `RefundStatus`, `WebhookEvent`,
…) is re-exported from `./types`.

## Boundary

`@suluk/payments` is the provider-agnostic **seam that supersedes `@suluk/stripe`** — interface-first
(C048), with real connectors (Adyen, …) and the `@suluk/billing` rewire as follow-on builds. It is
dependency-free (zero native deps, only `fetch`), stores nothing itself, and returns money status
in-band. It's the transport [`@suluk/billing`](../billing/README.md) builds its Stripe plumbing on.

## License

Apache-2.0

## Enumerations

- [AuthenticationType](enumerations/AuthenticationType.md)
- [CaptureMethod](enumerations/CaptureMethod.md)
- [PaymentStatus](enumerations/PaymentStatus.md)
- [RefundStatus](enumerations/RefundStatus.md)

## Classes

- [ConnectorError](classes/ConnectorError.md)
- [IntegrationError](classes/IntegrationError.md)
- [NetworkError](classes/NetworkError.md)
- [PaymentLibError](classes/PaymentLibError.md)

## Interfaces

- [Address](interfaces/Address.md)
- [AmountVerdict](interfaces/AmountVerdict.md)
- [AuthorizeRequest](interfaces/AuthorizeRequest.md)
- [CaptureRequest](interfaces/CaptureRequest.md)
- [CardDetails](interfaces/CardDetails.md)
- [CartLine](interfaces/CartLine.md)
- [ClientSession](interfaces/ClientSession.md)
- [ConnectorConfig](interfaces/ConnectorConfig.md)
- [CreatePaymentSessionRequest](interfaces/CreatePaymentSessionRequest.md)
- [CreateSetupSessionRequest](interfaces/CreateSetupSessionRequest.md)
- [Discount](interfaces/Discount.md)
- [DiscountResult](interfaces/DiscountResult.md)
- [HandleResult](interfaces/HandleResult.md)
- [HttpOptions](interfaces/HttpOptions.md)
- [MinorAmount](interfaces/MinorAmount.md)
- [OrderDetail](interfaces/OrderDetail.md)
- [OrderTotal](interfaces/OrderTotal.md)
- [OrderTotalFull](interfaces/OrderTotalFull.md)
- [PaymentConnector](interfaces/PaymentConnector.md)
- [PaymentError](interfaces/PaymentError.md)
- [PaymentMethod](interfaces/PaymentMethod.md)
- [PaymentResponse](interfaces/PaymentResponse.md)
- [RedirectionData](interfaces/RedirectionData.md)
- [RefundRequest](interfaces/RefundRequest.md)
- [RefundResponse](interfaces/RefundResponse.md)
- [StripeConfig](interfaces/StripeConfig.md)
- [StripeWebhookEvent](interfaces/StripeWebhookEvent.md)
- [SyncRequest](interfaces/SyncRequest.md)
- [VerifyOptions](interfaces/VerifyOptions.md)
- [VoidRequest](interfaces/VoidRequest.md)
- [WebhookEvent](interfaces/WebhookEvent.md)
- [WebhookRouter](interfaces/WebhookRouter.md)

## Type Aliases

- [ConnectorAuth](type-aliases/ConnectorAuth.md)
- [ConnectorFactory](type-aliases/ConnectorFactory.md)
- [ConnectorRegistry](type-aliases/ConnectorRegistry.md)
- [Currency](type-aliases/Currency.md)
- [DiscountRejection](type-aliases/DiscountRejection.md)
- [Secret](type-aliases/Secret.md)
- [WebhookHandler](type-aliases/WebhookHandler.md)

## Variables

- [Currency](variables/Currency.md)
- [MOCK\_3DS\_CARD](variables/MOCK_3DS_CARD.md)
- [MOCK\_DECLINE\_CARD](variables/MOCK_DECLINE_CARD.md)
- [mockConnector](variables/mockConnector.md)
- [STRIPE\_EVENTS](variables/STRIPE_EVENTS.md)
- [STRIPE\_MIN\_CHARGE\_CENTS](variables/STRIPE_MIN_CHARGE_CENTS.md)
- [stripeConnector](variables/stripeConnector.md)

## Functions

- [cartFingerprint](functions/cartFingerprint.md)
- [composeTotal](functions/composeTotal.md)
- [computeDiscountAmount](functions/computeDiscountAmount.md)
- [idempotencyKey](functions/idempotencyKey.md)
- [orderTotal](functions/orderTotal.md)
- [paymentClient](functions/paymentClient.md)
- [prorateDiscount](functions/prorateDiscount.md)
- [requiresStripe](functions/requiresStripe.md)
- [stripeGet](functions/stripeGet.md)
- [stripePost](functions/stripePost.md)
- [subtotal](functions/subtotal.md)
- [timingSafeHexEqual](functions/timingSafeHexEqual.md)
- [toForm](functions/toForm.md)
- [validateDiscount](functions/validateDiscount.md)
- [verifyAmount](functions/verifyAmount.md)
- [verifyStripeSignature](functions/verifyStripeSignature.md)
- [webhookRouter](functions/webhookRouter.md)
