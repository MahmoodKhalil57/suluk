<p align="center">
  <a href="https://github.com/MahmoodKhalil57/suluk">
    <img src="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/wordmark.png" alt="Suluk" width="360" />
  </a>
</p>

<h1 align="center">@suluk/email</h1>

<p align="center"><b>The missing <code>EmailProvider</code> binding plus a pure, branded, per-locale template set — render a message, send it through a swappable provider.</b></p>

---

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```sh
bun add @suluk/email
```

Strings flow through `@suluk/i18n` (a workspace dependency), so every template works out of the box
in English and localizes — including RTL — when you supply a catalog.

## What it does

- **A swappable `EmailProvider` binding.** Pick one impl: `consoleProvider` (DEV — logs a summary, never
  touches the network) or `resendProvider` (a Workers-safe Resend binding over the REST API via `fetch`,
  no `resend` SDK). `pickProvider({ dev, apiKey, from })` chooses between them. Providers never throw —
  a failed send returns `{ ok: false, error }`.
- **A pure branded HTML generator.** `renderEmailHtml(options, ctx)` is a deterministic `options → HTML`
  function. Colors, logo, name, and base URL are parameters (no hardcoded brand); the `<html dir>` and
  `<lang>` come from the locale.
- **A per-event template set.** `verifyEmail`, `resetPasswordEmail`, `changeEmailEmail`,
  `deleteAccountEmail`, `orderConfirmationEmail`, `orderStatusEmail`, `newsletterEmail` — each returns a
  sendable `{ subject, html }` you spread into a provider with a `to`.
- **Audience-sync.** `syncNewsletter` reconciles your newsletter rows to a provider audience/list
  (subscribed → upsert, unsubscribed → remove) through a swappable `AudienceProvider`
  (`consoleAudience` / `resendAudience`).

## When to reach for it

- You need to **send transactional or marketing email** from a Suluk app and want the dev/prod provider
  switch, the Resend-over-`fetch` binding, and a branded localized template set handed to you.
- You're on **Cloudflare Workers** and can't use the `resend` SDK — `resendProvider` is fetch-only.
- You want email **content** (subject + HTML) as a pure value you can test, snapshot, and localize,
  decoupled from how it's sent.

Reach for **`@suluk/i18n`** directly when you only need string translation, and **`@suluk/theme`** for the
design-token contract. This package is the email-specific layer that composes both.

## Usage

### Send through the provider binding

```ts
import { pickProvider } from "@suluk/email";

// dev ⇒ consoleProvider (logs, no network); prod ⇒ resendProvider over the REST API.
// Missing apiKey/from also falls back to the safe dev provider.
const provider = pickProvider({
  dev: process.env.NODE_ENV !== "production",
  apiKey: process.env.RESEND_API_KEY,
  from: "Acme <noreply@acme.com>", // a verified Resend domain in prod
});

const result = await provider.send({
  to: "user@example.com",
  subject: "Hi",
  html: "<p>Hello.</p>",
});
// result: { ok: boolean; id?: string; error?: string; costMicroUsd?: number }
```

`consoleProvider()` and `resendProvider({ apiKey, from })` can also be constructed directly. Both accept an
injected `fetch`/`log` for tests, and `resendProvider` takes an optional `costMicroUsd` advisory for
`@suluk/cost` metering.

### Render a branded message from a template

Each template takes its params plus a `TemplateContext` (`{ brand, messages?, dir?, lang?, year? }`) and
returns a `{ subject, html }` you spread into a send:

```ts
import { verifyEmail, pickProvider, type EmailBrand } from "@suluk/email";

const brand: EmailBrand = { brandName: "Acme", baseUrl: "https://acme.com" };

const message = verifyEmail(
  { verifyUrl: "https://acme.com/verify?token=abc", userName: "Sam" },
  { brand },
);

await pickProvider({ dev: false, apiKey, from }).send({
  to: "user@example.com",
  ...message, // subject + html
});
```

The auth lifecycle (`verifyEmail`, `resetPasswordEmail`, `changeEmailEmail`, `deleteAccountEmail`) plugs
straight into Better Auth's `sendVerificationEmail` / `sendResetPassword` hooks.

### Ecommerce + marketing templates

```ts
import { orderConfirmationEmail, newsletterEmail } from "@suluk/email";

const order = orderConfirmationEmail(
  {
    orderNumber: "1042",
    items: [{ name: "Widget", qty: 2, totalCents: 3998 }],
    totalCents: 3998,
    currency: "USD",
    locale: "en-US",                 // amounts formatted via Intl
    shippingAddress: ["Jane Doe", "12 Oak St", "Austin, TX 78701", "US"],
    orderUrl: "https://acme.com/orders/1042",
  },
  { brand },
);

const news = newsletterEmail(
  { subject: "June update", heading: "What's new", bodyHtml: "<p>…</p>", unsubscribeUrl: "https://acme.com/u/abc" },
  { brand },
);
```

### Pure render, custom brand + locale

`renderEmailHtml` is the generator the templates wrap — call it directly to build your own message body.
Brand accents are parameters and the document direction comes from the locale:

```ts
import { renderEmailHtml } from "@suluk/email";

const html = renderEmailHtml(
  { icon: "✉", heading: "مرحبا", body: "<p>…</p>", ctaLabel: "تأكيد", ctaUrl: "https://acme.com/c" },
  {
    brand: { brandName: "Acme", baseUrl: "https://acme.com", accentFrom: "#0066ff", accentTo: "#3399ff" },
    messages: { didNotRequest: "لم تطلب هذا؟" }, // overrides English defaults (DEFAULT_EMAIL_STRINGS)
    dir: "rtl",
    lang: "ar",
  },
);
```

### Sync the newsletter audience

```ts
import { resendAudience, syncNewsletter, type NewsletterRow } from "@suluk/email";

const rows: NewsletterRow[] = [
  { email: "a@b.co", status: "subscribed" },
  { email: "e@f.co", status: "unsubscribed" },
];

const audience = resendAudience({ apiKey: process.env.RESEND_API_KEY! });
const tally = await syncNewsletter(audience, "aud_123", rows);
// tally: { upserted: number; removed: number; failed: number }
```

`syncNewsletter` drives the audience from your DB rows (the source of truth) so the two never drift. Use
`consoleAudience()` in dev.

## API

| Export | What it does |
| --- | --- |
| `pickProvider(opts)` | dev ⇒ `consoleProvider`, prod ⇒ `resendProvider`; safe fallback when key/from missing |
| `consoleProvider(opts?)` | DEV `EmailProvider` — logs a summary, never sends |
| `resendProvider(opts)` | Workers-safe Resend `EmailProvider` over the REST API (`fetch`, no SDK) |
| `renderEmailHtml(options, ctx)` | pure branded-HTML generator (the email analogue of render-form) |
| `DEFAULT_EMAIL_STRINGS` | English fallbacks for the chrome strings (footer, "did not request") |
| `verifyEmail` / `resetPasswordEmail` / `changeEmailEmail` / `deleteAccountEmail` | auth-lifecycle templates → `{ subject, html }` |
| `orderConfirmationEmail` / `orderStatusEmail` / `newsletterEmail` | ecommerce + marketing templates |
| `TEMPLATE_STRINGS` | the full English string catalog the templates use |
| `consoleAudience` / `resendAudience` | swappable `AudienceProvider` impls (dev / Resend Audiences) |
| `syncNewsletter(provider, audienceId, rows)` | reconcile `NewsletterRow[]` → audience, returns `SyncResult` |

Key types: `EmailProvider`, `EmailMessage`, `SendResult`, `ConsoleProviderOptions`, `ResendProviderOptions`,
`EmailBrand`, `BrandedEmailOptions`, `RenderContext`, `TemplateContext`, `OrderLine`, `AudienceProvider`,
`AudienceContact`, `AudienceResult`, `ConsoleAudienceOptions`, `ResendAudienceOptions`, `NewsletterRow`,
`SyncResult`.

## Boundary

This package **renders and sends — it never hosts a mailer.** `resendProvider` is a thin binding to an
external service (like a rate-limit KV binding), not a Suluk-hosted mail service: it just `fetch`es the
Resend REST API. The send mechanism and the dev/prod switch live here; what stays app-side is your own
branding, copy, and the `{ to, from }` addressing you spread in — and the API key, which you inject
(pulled from `@suluk/env` and passed through, since on Workers the secret comes from the Worker env, not
`process.env`). Templates are pure values: deterministic, testable, localized via an injected
`@suluk/i18n` catalog.

## License

Apache-2.0.
