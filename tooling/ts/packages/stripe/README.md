<p align="center">
  <a href="https://github.com/MahmoodKhalil57/suluk">
    <img src="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/wordmark.png" alt="Suluk" width="360" />
  </a>
</p>

<h1 align="center">@suluk/stripe</h1>

<p align="center"><b>First-class Stripe behind a swappable <code>PaymentProvider</code> — usage billing, checkout, and webhooks as pure logic over an injected client.</b></p>

---

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```sh
bun add @suluk/stripe
```

`stripe` is an **optional** peer dependency. The Stripe SDK satisfies the duck-typed `StripeLike` /
`StripeCheckoutLike` client interfaces — but you can also drive everything over the bundled SDK-free
`restStripe` REST adapter (Workers-safe, fetch-only), and the pure math/routing helpers need no client at all.

## What it does

- **Usage-based billing** via Stripe's modern Billing Meters API — meters, meter events, and metered
  prices. `setupUsageBilling` provisions the product/meter/price; `stripeProvider` reports usage.
- **A bridge from `@suluk/cost`** — turn accrued cost events into the meter events you bill on
  (`usageEventsFromCost` / `reportCostUsage`), per principal, priced on raw cost-µ$ or request count.
- **A money-exact checkout core** — integer-cent pricing, discounts, proration, anti-tampering amount
  verification, deterministic idempotency keys, and an anti-double-charge payment-intent planner.
- **Pluggable shipping + tax adapters** — swap flat-rate for Shippo / EasyPost / TaxJar / Stripe Tax
  behind one interface, without touching checkout.
- **Webhooks two ways** — an SDK-free Web-Crypto signature verifier (`verifyStripeSignature`, one
  verifier for dev + Workers prod) and a typed event router (`webhookRouter` + `STRIPE_EVENTS`).

The Stripe-specific param builders are **pure** (they emit exact Stripe API payloads, testable with no
SDK); the flows call a duck-typed client. `stripeProvider` / `stripeCheckout` are the swap point — other
processors implement the same interface.

## When to reach for it

- You're metering an API and want to bill usage through Stripe Billing Meters — especially when you
  already track spend with `@suluk/cost` and want a one-line bridge to invoices.
- You're building a cart/checkout and need the *trust* layer: never charge a client-supplied amount,
  never double-charge on a retry, and keep every total surface in agreement to the cent.
- You need webhook verification that runs identically on a dev server and a Cloudflare Worker, with no
  `stripe` SDK on the edge.

It is **logic, not a hosted service**: it builds payloads, verifies signatures, and decides what to do —
your app holds the secret key, the database, and the HTTP boundary. See [Boundary](#boundary).

## Usage

### Usage billing (Billing Meters)

`setupUsageBilling` is a one-time provisioning step; `stripeProvider` is the runtime surface. Pass any
`StripeLike` client — the real `stripe` SDK, or the bundled `restStripe` adapter on a Worker.

```ts
import { restStripe, setupUsageBilling, stripeProvider } from "@suluk/stripe";

const client = restStripe(process.env.STRIPE_SECRET_KEY!); // SDK-free, fetch-only — Workers-safe

// one-time: product + meter + metered price. Save the returned ids.
const { priceId, eventName } = await setupUsageBilling(client, {
  productName: "API usage",
  eventName: "api_cost",
  currency: "usd",
  unitAmountDecimal: "0.000002", // per aggregated unit (a decimal string)
  aggregation: "sum",
  interval: "month",
});

// runtime
const billing = stripeProvider(client, { webhookSecret: process.env.STRIPE_WEBHOOK_SECRET });
const { id: customerId } = await billing.createCustomer({ email: "user@acme.dev" });
await billing.subscribeMetered({ customerId, priceId });
await billing.reportUsage({ customerId, eventName, value: 4050 }); // one meter event
const { url } = await billing.billingPortalUrl!({ customerId, returnUrl: "https://app.dev/account" });
```

### Bridge `@suluk/cost` → Stripe usage

Aggregate cost events per principal and report them as meter events:

```ts
import { reportCostUsage, stripeProvider } from "@suluk/stripe";

const reported = await reportCostUsage(
  stripeProvider(client),
  costEvents, // CostEvent[] from @suluk/cost
  {
    eventName: "api_cost",
    customerOf: (principal) => customerIdFor(principal), // skip principals with no customer
    basis: "cost-micro-usd", // or "request-count"
  },
);
```

`usageEventsFromCost(events, cfg)` is the pure variant — it returns the meter-event params without
calling Stripe, for batching or inspection.

### Checkout — the anti-double-charge / anti-tampering core

`planPaymentIntent` is pure and fully testable: it recomputes the authoritative total from your line
prices, derives a deterministic idempotency key, and decides create / reuse / update. `stripeCheckout`
executes the plan against Stripe.

```ts
import { planPaymentIntent, stripeCheckout, type CartLine } from "@suluk/stripe";

const lines: CartLine[] = [{ id: "a", unitCents: 1999, qty: 2 }, { id: "b", unitCents: 500, qty: 1 }];

const plan = planPaymentIntent({
  lines,
  scope: userId,            // namespaces the idempotency key (two users' identical carts don't collide)
  currency: "usd",
  claimedCents: bodyAmount, // optional: the amount the browser posted, for anti-tampering
});

if (plan.amountVerdict && !plan.amountVerdict.ok) throw new Error("amount tampered");

const checkout = stripeCheckout(stripeSdk); // a StripeCheckoutLike client
const intent = await checkout.applyIntentPlan(plan); // create (idempotent) / reuse / update
```

The `stripeCheckout` binding also covers `getOrCreateCustomer`, the saved-card vault
(`listPaymentMethods` / `createSetupIntent` / `detachPaymentMethod`, guarded by ownership).

### Pricing, shipping, and tax

Pure, integer-cent money math. Compose one authoritative total so every surface agrees:

```ts
import { orderTotal, composeTotal, verifyAmount } from "@suluk/stripe";
import { flatRateShipping, resolveShipping, flatRateTax, resolveTax } from "@suluk/stripe";

const shipping = flatRateShipping({ flatCents: 500, freeOverCents: 5000 });
const tax = flatRateTax({ rate: 0.08, label: "Sales tax" });

const { totalCents: subAfterDiscount } = orderTotal(lines, discount);
const ship = await resolveShipping(shipping, { subtotalCents: subAfterDiscount, lines: cartLines });
const t = await resolveTax(tax, { subtotalCents: subAfterDiscount, shippingCents: ship?.amountCents });

const total = composeTotal({
  subtotalCents: subAfterDiscount,
  shippingCents: ship?.amountCents,
  taxCents: t.taxCents,
});

// anti-tampering: recompute and reject a client-claimed amount that doesn't match
verifyAmount(lines, discount, claimedCents).ok; // false ⇒ reject before charging
```

Swap `flatRateShipping` for a `combineShipping(...)` of carrier providers, or `flatRateTax` for `noTax()`
(let Stripe Tax handle it) — same `ShippingProvider` / `TaxProvider` interface, no checkout changes.

### Webhooks

Verify with no SDK (the edge path — works in Bun, Node 18+, and Workers), then route by type:

```ts
import { verifyStripeSignature, webhookRouter, STRIPE_EVENTS } from "@suluk/stripe";

const raw = await req.text(); // RAW body — re-serializing JSON breaks the HMAC
const ok = await verifyStripeSignature(raw, req.headers.get("stripe-signature") ?? "", secret);
if (!ok) return new Response("bad signature", { status: 400 });

const router = webhookRouter()
  .on(STRIPE_EVENTS.paymentSucceeded, async (e) => { /* fulfil the order */ })
  .on(STRIPE_EVENTS.invoicePaid, async (e) => { /* mark paid */ })
  .onUnhandled((e) => console.log("unhandled", e.type));

await router.handle({ type: event.type, data: event.data });
```

SDK callers can use `stripeProvider(client).verifyWebhook(raw, sig)` instead (Stripe's `constructEvent`).
To resolve a PaymentIntent → order on the edge, `retrievePaymentIntent(key, id, { expand: ["latest_charge"] })`.

## API

| Export | What it does |
| --- | --- |
| `setupUsageBilling` | provision product + Billing Meter + metered price (returns the ids) |
| `stripeProvider` | the `PaymentProvider` — customers, metered subscriptions, usage, portal, webhook |
| `usageEventsFromCost` / `reportCostUsage` | aggregate `@suluk/cost` events → meter events (pure / reporting) |
| `restStripe` | SDK-free `StripeLike` client over the Stripe REST API (fetch-only, Workers-safe) |
| `stripeGet` / `retrievePaymentIntent` / `toForm` | low-level read surface + Stripe form-encoding |
| `planPaymentIntent` / `stripeCheckout` | pure intent planner (create/reuse/update) + the Stripe binding |
| `cardInfoFrom` / `ownsPaymentMethod` | saved-card mapping + cross-account ownership guard |
| `orderTotal` / `composeTotal` / `verifyAmount` | authoritative totals + anti-tampering |
| `subtotal` / `validateDiscount` / `computeDiscountAmount` / `prorateDiscount` | integer-cent pricing primitives |
| `cartFingerprint` / `idempotencyKey` / `requiresStripe` / `STRIPE_MIN_CHARGE_CENTS` | retry-safety + the $0.50 floor |
| `flatRateShipping` / `combineShipping` / `resolveShipping` / `cartNeedsShipping` | pluggable shipping adapters |
| `flatRateTax` / `noTax` / `resolveTax` | pluggable tax adapters |
| `verifyStripeSignature` / `timingSafeHexEqual` | SDK-free Web-Crypto webhook verification |
| `webhookRouter` / `STRIPE_EVENTS` | typed event dispatch (the alternative to one giant `switch`) |

Param builders (`customerParams`, `productParams`, `meterParams`, `meteredPriceParams`,
`subscriptionParams`, `meterEventParams`, `billingPortalSessionParams`) are exported too — they emit exact
Stripe API payloads and are what the flows above are built from. All exports come from the single entry
point (`@suluk/stripe`); there are no sub-path exports.

## Boundary

This is the **render/generate, never host** L3 line for payments. The package decides and builds — it
provisions meters, plans payment intents, verifies signatures, and computes money — but it never holds
your Stripe secret key, your database, or the HTTP request. The Stripe client is an **injected port**
(`StripeLike` / `StripeCheckoutLike`, or `restStripe`'s injectable `fetch`); the secret key is passed in;
the raw webhook bytes are handed to the verifier. Persistence (orders, customer↔principal mapping),
routing, and the secret-key store stay app-side. Adding a non-Stripe processor means implementing the
same `PaymentProvider` / `CheckoutProvider` interface — Stripe is the reference, not a hard dependency.

## License

Apache-2.0
