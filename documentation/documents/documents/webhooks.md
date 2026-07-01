[**Suluk**](../../README.md)

***

[Suluk](../../packages.md) / [Registry](../Registry.md) / webhooks

# Webhooks — verified inbound Stripe + idempotent dispatch

> Own the wiring (the Effect service, the Hono route, the dedup table, the provision fragment); npm the money-critical logic (SDK-free signature verification + the typed event router stay in `@suluk/payments`, so a fix flows to everyone).

An Effect-TS Webhooks service over `@suluk/payments`' inbound Stripe surface: verify the RAW body against `stripe-signature`, dedup on the Stripe event id, then route the verified event to a handler.

---

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf. This is a [shadcn registry](https://ui.shadcn.com/docs/registry/github)
> module — code you own, wired over the `@suluk/*` npm packages.

## Install

```sh
pnpm dlx shadcn@latest add MahmoodKhalil57/suluk/webhooks
# or:  npx shadcn@latest add MahmoodKhalil57/suluk/webhooks
# pin to a ref:  MahmoodKhalil57/suluk/webhooks#main
```

`registryDependencies` pull in the base [`app`](https://github.com/MahmoodKhalil57/suluk/tree/main/registry/app) module automatically (the shared Hono app + the
Effect `Db` service). The module drops four files into your app and installs its npm deps.

## What you get

| File | Target | What it is |
| --- | --- | --- |
| `webhooks.service.ts` | `src/services/webhooks.ts` | The `Webhooks` Effect service (`Context.Tag` + `WebhooksLive` layer). |
| `webhooks.routes.ts` | `src/routes/webhooks.ts` | The Hono route — `POST /webhooks/stripe`. |
| `webhooks.schema.ts` | `src/db/webhooks.ts` | The owned `webhook_event` Drizzle table (the dedup ledger). |
| `webhooks.provision.ts` | `provision/webhooks.ts` | The `InstanceSpec[]` fragment — the migration for `webhook_event`. |

**The Effect service** (`Webhooks`) exposes two operations, composed as
`Layer.provide(WebhooksLive, DbLive(env))` (it also needs `WebhookCfgLive(env)` for the signing secret):

- **`verify(rawBody, signatureHeader)`** — calls `verifyStripeSignature` (Web Crypto HMAC-SHA256, replay
  window enforced) against the RAW bytes and the `STRIPE_WEBHOOK_SECRET`; returns the typed
  `StripeWebhookEvent`, or `null` on a bad/stale signature (the caller returns 400). It parses the body
  only **after** the HMAC checks out.
- **`dispatch(event)`** — claims the Stripe event id in the owned `webhook_event` table via a single
  `INSERT … onConflictDoNothing`; if the id already exists it returns `{ deduped: true }` (Stripe is
  at-least-once, so a redelivery is a no-op). Otherwise it routes the event through `webhookRouter` and
  returns `{ deduped: false, result }`.

Handlers are a documented **STUB** set (`defaultHandlers`) — a no-op on
`STRIPE_EVENTS.checkoutCompleted` that the app replaces with real fulfillment (e.g. a `credits.grant`
call). It's kept here rather than importing `@suluk/credits`, so the webhook module stays decoupled.

**The route** (`webhooksRoutes()`) mounts one endpoint, `POST /webhooks/stripe`. It reads the RAW body
with `c.req.text()` (NOT `.json()` — re-serializing would change the bytes Stripe signed), reads the
`stripe-signature` header, then `verify` → `dispatch`. Returns **200** on success (so Stripe stops
redelivering) and **400** on a bad/stale signature. Mount it with `app.route("/webhooks", webhooksRoutes())`.

**The owned table** (`webhookEvent` → `webhook_event`) is the at-least-once dedup ledger: one row per
processed event, keyed on the Stripe event id (`evt_…`), with the event `type` and `processedAt` kept for
auditing. The provision fragment adds its migration (`0005_webhooks`) to the shared app database
(`ref: "db"`) — merge it into your `provision.config.ts` alongside the other modules and run
`@suluk/provision` (`plan`/`apply`).

## Dependencies

- **npm (`dependencies`):** `@suluk/payments` (the inbound Stripe surface — verification + routing),
  `@suluk/provision` (the `InstanceSpec` type for the fragment), `effect`, `drizzle-orm`, `hono`.
- **registry (`registryDependencies`):** [`MahmoodKhalil57/suluk/app`](https://github.com/MahmoodKhalil57/suluk/tree/main/registry/app) — the base Hono app + the
  Effect `Db` service this module injects.

## Own the wiring, npm the logic

This module **owns** the service wiring, the route, the `webhook_event` dedup table, and the provision
fragment — all yours to edit. The two hard, security-critical parts stay **upstream in `@suluk/payments`**
so a correctness fix flows to everyone via npm, never a forked money path:

- **`verifyStripeSignature`** — SDK-free HMAC-SHA256 over `${timestamp}.${rawBody}`, with the timestamp
  checked against Stripe's replay window (default 300s). Never diverge this in your app.
- **`webhookRouter`** — a typed router that dispatches on `event.type` (via `STRIPE_EVENTS`) instead of one
  giant switch. You supply the handler map; the routing logic is upstream.

Fulfillment (what a handler *does*) is intentionally the app's job — override `defaultHandlers` in your
copy to keep webhooks decoupled from `@suluk/credits` and the rest of your business logic.

## License

Apache-2.0
