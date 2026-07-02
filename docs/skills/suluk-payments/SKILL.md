---
description: "Provider-agnostic payments — a Workers-native TypeScript reimplementation of the Hyperswitch Prism connector interface. ONE unified request schema (authorize/capture/void/refund/sync + optional customer/tokenize/recurring/webhook); switch processor by config, not code. Prism's native FFI core can't run on the edge, so we adopt its interface + integer-exact status semantics and implement over fetch — zero native deps, light, swappable. The seam that supersedes @suluk/stripe. INTERFACE-first (C048); real connectors + the billing rewire follow. CANDIDATE tooling."
name: suluk-payments
---

# @suluk/payments

Provider-agnostic payments — a Workers-native TypeScript reimplementation of the Hyperswitch Prism connector interface. ONE unified request schema (authorize/capture/void/refund/sync + optional customer/tokenize/recurring/webhook); switch processor by config, not code. Prism's native FFI core can't run on the edge, so we adopt its interface + integer-exact status semantics and implement over fetch — zero native deps, light, swappable. The seam that supersedes @suluk/stripe. INTERFACE-first (C048); real connectors + the billing rewire follow. CANDIDATE tooling.

## Quick Start

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

## Configuration

4 configuration interfaces — see references/config.md for details.

## Quick Reference

67 exports (17 functions, 4 classes, 35 types, 4 enums, 7 constants) — see references/ for full API.

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When using a class → read `references/classes.md` for properties, methods, and inheritance
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)