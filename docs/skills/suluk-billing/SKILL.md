---
description: "Stripe PLUMBING over an injected config (secret key + a mockable fetch): the HTTP transport (with the refund idempotency-key), customer/SetupIntent/PaymentIntent creation, the saved-card surface, the money-moving paths (hosted Checkout + portal + on-default-card top-up + off-session charge), Stripe Tax, the subscription mechanics over a generic SubPlan catalog, and the package-owned billing-account store. Pure Stripe wrappers — the webhook dispatch, credit grants, branded email, the pricing matrix, and refund/pooling stay in the app. Extracted from a real app (C046). CANDIDATE tooling."
name: suluk-billing
---

# @suluk/billing

Stripe PLUMBING over an injected config (secret key + a mockable fetch): the HTTP transport (with the refund idempotency-key), customer/SetupIntent/PaymentIntent creation, the saved-card surface, the money-moving paths (hosted Checkout + portal + on-default-card top-up + off-session charge), Stripe Tax, the subscription mechanics over a generic SubPlan catalog, and the package-owned billing-account store. Pure Stripe wrappers — the webhook dispatch, credit grants, branded email, the pricing matrix, and refund/pooling stay in the app. Extracted from a real app (C046). CANDIDATE tooling.

## Quick Start

```ts
import {
  createCustomer, createCheckout, createPaymentIntentOnDefaultCard,
  createSubscriptionOnDefaultCard, type StripeConfig, type SubPlan,
} from "@suluk/billing";

// The injected config — a Worker passes global fetch; a test passes a mock.
const cfg: StripeConfig = { secretKey: env.STRIPE_SECRET_KEY };

// A hosted Checkout for a one-time top-up (app supplies product name + URLs).
const { url } = await createCheckout(cfg, {
  customerId: await ensureCustomer(cfg, userId),
  amountCents: 2000,
  productName: "1,000 credits",
  successUrl: "https://app.example/thanks",
  cancelUrl: "https://app.example/billing",
});

// One-click top-up on the saved default card.
await createPaymentIntentOnDefaultCard(cfg, { customerId, amountCents: 2000, meta: { userId, credits: "1000" } });
```

## Configuration

**StripeConfig** — The low-level Stripe HTTP transport (C048) — the fetch-based Stripe client the stripeConnector rides, exported
so an app's Stripe-PLATFORM operations (hosted Checkout, subscriptions, saved-card management, Tax — the things the
agnostic PaymentConnector deliberately doesn't model) ride the SAME client instead of a separate legacy one. This is
intentionally Stripe-specific: agnostic payment FLOWS go through the connector, these platform ops through this
transport — one Stripe roof, no accidental second path. Workers-native (fetch + x-www-form-urlencoded), zero deps. (2 options — see references/config.md)

## Quick Reference

48 exports (35 functions, 12 types, 1 constants) — see references/ for full API.

## References

Load these on demand — do NOT read all at once:

- When calling any function → browse `references/functions/` for grouped indexes, full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)