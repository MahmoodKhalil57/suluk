[**Suluk**](../../README.md)

***

[Suluk](../../packages.md) / @suluk/billing

<p align="center">
  <a href="https://github.com/MahmoodKhalil57/suluk">
    <img src="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/wordmark.png" alt="Suluk" width="360" />
  </a>
</p>

<h1 align="center">@suluk/billing</h1>

<p align="center"><b>Pure Stripe plumbing over an injected, mockable config — the transport, saved cards, the money-moving paths, Stripe Tax, generic subscriptions, and the billing-account store. Policy stays in your app.</b></p>

<p align="center">
  <em>Part of <a href="https://github.com/MahmoodKhalil57/suluk">Suluk</a> — one typed OpenAPI v4 contract projecting into every full-stack layer.</em>
</p>

---

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```sh
bun add @suluk/billing
```

## What it does

Stripe wrappers, extracted verbatim from a real app (C046), over an **injected `StripeConfig`**
(a secret key plus a mockable `fetch`) so every call site is testable without hitting Stripe. It is
deliberately just the plumbing:

- **Transport** — `stripePost` / `stripeGet` / `toForm`, including the refund idempotency-key.
- **Customer + intents** — `createCustomer`, `createSetupIntent`, `createPaymentIntent`, and the
  **saved-card surface** (`listPaymentMethods`, `defaultCard`, `setDefaultPaymentMethod`, `ownsPaymentMethod`, …).
- **Money-moving paths** — hosted Checkout (`createCheckout` / `createSubscriptionCheckout`), the
  billing **portal**, on-default-card top-up (`createPaymentIntentOnDefaultCard`), and the
  off-session charge (`chargeOffSession`).
- **Stripe Tax** — `calculateTax` / `recordTaxTransaction`, graceful by design (any failure →
  `taxCents 0`, the top-up still proceeds).
- **Subscriptions** — the recurring-billing mechanics made **generic over a `SubPlan` catalog** the
  app supplies (find-or-create pricing, create-on-default-card, live status, in-place plan change).
- **The billing-account store** — the package-owned `user ↔ Stripe` link (`billingAccount`), applied
  by the app's migrations over an injected Drizzle handle.

What **stays in the app** (policy, not library): the Stripe **webhook dispatch** (which composes
`@suluk/payments`' `webhookRouter` + these primitives + `@suluk/credits.grantOnce`), the branded
email templates, payment-alert kinds, and refund/subscription pooling.

## Usage

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

Subscriptions are generic over your plan catalog — the pricing matrix stays in the app:

```ts
import { planById, createSubscriptionOnDefaultCard, changeSubscriptionPlan } from "@suluk/billing";

const plans: SubPlan[] = [
  { id: "pro", name: "Pro", credits: 5000, priceCents: 2900, label: "Pro — $29/mo" },
];

const sub = await createSubscriptionOnDefaultCard(cfg, { customerId, plan: planById(plans, "pro")! });
```

The billing-account store owns the `user ↔ Stripe` link (inject a Drizzle handle):

```ts
import { billingAccount, linkBillingCustomer, billingCustomerId } from "@suluk/billing";
// include `billingAccount` in your migration; `userId` is the PK as a plain column.
await linkBillingCustomer(db, userId, "cus_123");
const existing = await billingCustomerId(db, userId); // "cus_123" | null
```

## What's inside

| Module | Exports |
| --- | --- |
| **transport** | `stripePost`, `stripeGet`, `toForm`, `StripeConfig`. |
| **billing** (v1) | `createCustomer`, `createSetupIntent`, `createPaymentIntent`, the saved-card surface (`listPaymentMethods`, `defaultCard`, `defaultPaymentMethodId`, `ownsPaymentMethod`, `setDefaultPaymentMethod`, `detachPaymentMethod`, …), `payOpenInvoice`. |
| **payments** (v2) | `createCheckout`, `createSubscriptionCheckout`, `createPortalSessionForCustomer`, `createPaymentIntentOnDefaultCard`, `chargeOffSession`. |
| **tax** (v2) | `calculateTax`, `recordTaxTransaction` (graceful → 0 on failure). |
| **subscriptions** (v2) | `SubPlan`, `planById`, `planByPrice`, `ceilingFor`, `ensurePlanPrice`, `createSubscriptionOnDefaultCard`, `getSubscriptionStatus`, `changeSubscriptionPlan`. |
| **account** (v2) | `billingAccount` (schema), `billingCustomerId`, `billingSubscriptionId`, `linkBillingCustomer`, `upsertBillingAccount`, `clearSubscription`. |

## Boundary

The whole surface is **pure Stripe wrappers over an injected config** — inject the config (secret +
`fetch`) and the Drizzle handle, and everything is deterministically testable. Charging **policy**
(webhook routing, crediting, branded email, refund/pooling) is the app's, not the library's.

Depends on [`@suluk/payments`](../payments/README.md), [`@suluk/drizzle`](../drizzle/README.md), and `drizzle-orm`. It
composes with [`@suluk/credits`](../credits/README.md) in the app's webhook handler (grant credits on a paid
invoice).

## License

Apache-2.0

## Interfaces

- [ChangePlanResult](interfaces/ChangePlanResult.md)
- [CheckoutOpts](interfaces/CheckoutOpts.md)
- [PaymentMethodWire](interfaces/PaymentMethodWire.md)
- [StripeConfig](interfaces/StripeConfig.md)
- [SubPlan](interfaces/SubPlan.md)
- [SubscriptionBranding](interfaces/SubscriptionBranding.md)
- [SubscriptionCheckoutOpts](interfaces/SubscriptionCheckoutOpts.md)
- [SubscriptionStatus](interfaces/SubscriptionStatus.md)
- [TaxAddress](interfaces/TaxAddress.md)
- [TaxLocation](interfaces/TaxLocation.md)
- [TaxResult](interfaces/TaxResult.md)

## Type Aliases

- [BillingDB](type-aliases/BillingDB.md)
- [TopupMeta](type-aliases/TopupMeta.md)

## Variables

- [billingAccount](variables/billingAccount.md)

## Functions

- [billingCustomerId](functions/billingCustomerId.md)
- [billingSubscriptionId](functions/billingSubscriptionId.md)
- [calculateTax](functions/calculateTax.md)
- [ceilingFor](functions/ceilingFor.md)
- [changeSubscriptionPlan](functions/changeSubscriptionPlan.md)
- [chargeOffSession](functions/chargeOffSession.md)
- [clearSubscription](functions/clearSubscription.md)
- [createCheckout](functions/createCheckout.md)
- [createCustomer](functions/createCustomer.md)
- [createPaymentIntent](functions/createPaymentIntent.md)
- [createPaymentIntentOnDefaultCard](functions/createPaymentIntentOnDefaultCard.md)
- [createPortalSessionForCustomer](functions/createPortalSessionForCustomer.md)
- [createSetupIntent](functions/createSetupIntent.md)
- [createSubscriptionCheckout](functions/createSubscriptionCheckout.md)
- [createSubscriptionOnDefaultCard](functions/createSubscriptionOnDefaultCard.md)
- [defaultCard](functions/defaultCard.md)
- [defaultPaymentMethodId](functions/defaultPaymentMethodId.md)
- [detachPaymentMethod](functions/detachPaymentMethod.md)
- [ensurePlanPrice](functions/ensurePlanPrice.md)
- [getSubscriptionStatus](functions/getSubscriptionStatus.md)
- [linkBillingCustomer](functions/linkBillingCustomer.md)
- [listPaymentMethods](functions/listPaymentMethods.md)
- [mockStripeFetch](functions/mockStripeFetch.md)
- [ownsPaymentMethod](functions/ownsPaymentMethod.md)
- [payOpenInvoice](functions/payOpenInvoice.md)
- [planById](functions/planById.md)
- [planByPrice](functions/planByPrice.md)
- [recordTaxTransaction](functions/recordTaxTransaction.md)
- [setDefaultPaymentMethod](functions/setDefaultPaymentMethod.md)
- [setSubscriptionCancel](functions/setSubscriptionCancel.md)
- [setSubscriptionDefaultCard](functions/setSubscriptionDefaultCard.md)
- [stripeGet](functions/stripeGet.md)
- [stripePost](functions/stripePost.md)
- [toForm](functions/toForm.md)
- [upsertBillingAccount](functions/upsertBillingAccount.md)
