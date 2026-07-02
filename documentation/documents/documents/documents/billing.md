[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [Registry](../../Registry.md) / [Services](../Services.md) / billing

# Billing — Stripe customer + browser sessions + cards

An Effect-TS Billing service over `@suluk/billing` (which runs on `@suluk/payments`' agnostic
connector + client-token surface): ensure-customer, Payment-Element + add-card sessions, saved
cards, hosted/one-click top-up, subscriptions, tax + purchase quotes, and a module-owned credit
refund — all `/api/billing/*`, server-authoritative on price.

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable to
> ratify anything on the SIG's behalf. This is an own-the-code shadcn registry module (C050/C052),
> not an npm package.

## Install

```sh
pnpm dlx shadcn@latest add MahmoodKhalil57/suluk/billing
# or:  npx shadcn@latest add MahmoodKhalil57/suluk/billing
# pin to a ref:  MahmoodKhalil57/suluk/billing#main
```

`registryDependencies` (`app`) are pulled in automatically. The files drop into your app; then
merge `provision/billing.ts` into your `provision.config.ts` and run `@suluk/provision`
(`plan`/`apply`).

## What you get

Five owned files land in your app:

| File | Lands at | What it is |
| --- | --- | --- |
| `billing.service.ts` | `src/services/billing.ts` | the `Billing` Effect service (`Context.Tag` + `BillingLive` layer) |
| `billing.routes.ts` | `src/routes/billing.ts` | the Hono `billingRoutes()` — mount at `/api/billing` |
| `billing.schema.ts` | `src/db/billing.ts` | the Drizzle tables (one re-exported, two module-owned) |
| `billing.pricing.ts` | `src/pricing.ts` | the app-owned pricing matrix (packs, plans, buyback) |
| `billing.provision.ts` | `provision/billing.ts` | the D1 provision fragment (migrations + the Stripe secret bind) |

**The Effect service — `Billing`** (`Context.Tag` + `BillingLive`). It injects the shared `Db`
service (from `app`) and a `StripeCfg` service (built from `STRIPE_SECRET_KEY` at the route), and
exposes: `packs` / `plans`, `ensureCustomer`, `paymentSession` / `setupSession` (Payment-Element +
add-card client secrets), `checkout` / `paymentIntent` (hosted + one-click top-up),
`subscribe` / `subscriptionStatus` / `cancelSubscription` / `changePlan`,
`purchaseQuote` / `refundQuote`, `refund` (module-owned buyback), `cards` / `setDefaultMethod` /
`deleteMethod` / `portal`, and `getAutoTopup` / `saveAutoTopup` / `paymentHealth`.

**The routes — `billingRoutes()`.** Mount with `app.route("/api/billing", billingRoutes())`; every
path below is a sub-path:

- Pricing: `GET /packs`, `GET /plans`, `GET /payment-config`
- Top-up: `POST /checkout` (hosted), `POST /payment-intent` (on-site / one-click on the default card)
- Subscriptions: `POST /subscribe`, `GET|POST /subscription`, `POST /subscription-plan`
- Quotes: `GET /purchase-quote`, `GET /refund-quote`
- Refund: `POST /refund` (module-owned buyback)
- Cards/methods: `GET /methods`, `GET /cards/:userId`, `POST /methods/default`, `POST /methods/delete`
- Sessions (v1): `POST /customer`, `POST /payment-session`, `POST /setup-session`, `POST /portal`
- Owned tables: `GET|POST /auto-topup`, `GET /payment-health`

Money is **server-authoritative**: the client sends a pack/plan ID, never a price — amounts +
credits are derived from `src/pricing.ts` inside the service. The mutating routes read the caller's
`userId` off the authenticated principal (`c.get("user")` set by `auth`'s `identity` middleware),
never a body/query field, so a caller can only move **their own** money.

**Owned schema (`src/db/billing.ts`).** `billingAccount` (user ↔ Stripe customer + subscription) is
**re-exported from `@suluk/billing`** — the package owns it so a schema change ships as a package
update. Two tables are **module-owned** (app policy, excluded from the package): `auto_topup` (the
off-session auto-recharge config; `lastTriggeredAt` is the CAS anchor against double-charge) and
`payment_alert` (standing payment-health flags surfaced in the billing UI). Wire all three into your
migrations.

**Provision fragment (`provision/billing.ts`).** An `InstanceSpec[]` adding two ordered migrations
(`0003_billing`, `0006_billing_v2`) to the shared app D1 (`ref: "db"`) and **binding** (not
creating) the `STRIPE_SECRET_KEY` secret.

## Dependencies

- **npm** (`dependencies`): `@suluk/billing`, `@suluk/payments`, `@suluk/credits`,
  `@suluk/provision`, `effect`, `drizzle-orm`, `hono`.
- **registry** (`registryDependencies`): `MahmoodKhalil57/suluk/app` — the base Hono app + the
  Effect `Db` service, pulled in automatically.

## Own the wiring, npm the logic

You **own** the wiring — the `Billing` Effect service, the `/api/billing/*` routes, the two
module-owned tables, the app pricing matrix (COGS → markup → tier-discount packs/plans + the
buyback rate), and the provision fragment — all yours to edit.

The **money-correctness logic flows from npm**. `@suluk/billing` is the Stripe plumbing: customer +
intent creation, the saved-card surface, hosted Checkout / portal, the on-default-card top-up,
subscription mechanics over a generic `SubPlan` catalog, Stripe Tax, and the package-owned
`billing_account` store — running on `@suluk/payments`' agnostic connector + client-token surface.
The module-owned `refund` composes `@suluk/credits` (debit the credits **first**, then refund cash
across the customer's Stripe charges via the raw `stripePost`/`stripeGet` primitives, re-crediting
any shortfall) so a partial payout never silently swallows credits. What stays in **your app**: the
crediting Stripe **webhook** dispatch and the **pricing matrix** (C046/C048). A correctness fix in
the package reaches you via npm; a forked money path never happens.

## License

Apache-2.0
