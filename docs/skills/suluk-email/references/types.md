# Types & Enums

## provider

### `EmailProvider`
The swappable binding. An app picks one impl; the template set is provider-agnostic.
**Properties:**
- `id: string` — a stable id (e.g. "resend", "console") — matches the @suluk/builder provider-slot impl id.

### `EmailMessage`
A sendable message — a RenderedEmail plus addressing. The input to a provider.
**Properties:**
- `to: string | string[]`
- `from: string` (optional) — override the provider's default From.
- `replyTo: string` (optional)
- `subject: string`
- `html: string`
- `text: string` (optional)

### `SendResult`
`@suluk/email` — the missing EmailProvider binding + a per-event/per-locale branded template set. The app RENDERS
a message (pure, branded, localized via @suluk/i18n) and SENDS it through a swappable provider (consoleProvider in
dev; a Workers-safe resendProvider in prod). Never a hosted mailer — the provider is a thin binding (the
`@suluk/builder` `email` slot impl). CANDIDATE tooling.
**Properties:**
- `ok: boolean`
- `id: string` (optional) — the provider's message id, when sent.
- `error: string` (optional)
- `costMicroUsd: number` (optional) — the third-party send cost in µ$, for @suluk/cost metering (advisory).

### `MailboxSink`
A mailbox sink — where storeProvider SAVES instead of sending (a JSON file / sqlite in local dev). `list`
 powers a dev inbox view. Structurally typed so a bun-only file sink (e.g. `@suluk/cloudflare/local`) satisfies it.

### `StoredEmail`
A stored (mocked) email — what a local mailbox sink persists INSTEAD of sending.
**Properties:**
- `at: string` — ISO timestamp the message was captured.
- `to: string | string[]`
- `from: string` (optional) — override the provider's default From.
- `replyTo: string` (optional)
- `subject: string`
- `html: string`
- `text: string` (optional)

## render

### `EmailBrand`
The brand surface an email needs — defaults reproduce saastarter's terracotta look.
**Properties:**
- `brandName: string`
- `baseUrl: string`
- `accentFrom: string` (optional) — banner gradient start + CTA fill (default "#d4722a").
- `accentTo: string` (optional) — banner gradient end (default "#e8944d").
- `pageBg: string` (optional) — page background (default "#f5f3f0").
- `cardBg: string` (optional) — card background (default "#ffffff").
- `logoUrl: string` (optional) — an <img> logo URL; when omitted the brandName renders as a serif wordmark (saastarter behavior).

### `RenderContext`
**Properties:**
- `brand: EmailBrand`
- `messages: Catalog` (optional) — the email-namespace catalog for the active locale (@suluk/i18n); merged over English defaults.
- `dir: "ltr" | "rtl"` (optional) — writing direction for <html dir> (default "ltr").
- `lang: string` (optional) — BCP-47 lang for <html lang> (default "en").
- `year: number` (optional) — footer copyright year (default: current year).

## templates

### `TemplateContext`
Shared context for every template — the brand + the active-locale catalog (merged over English defaults).
**Properties:**
- `brand: EmailBrand`
- `messages: Catalog` (optional) — the email-namespace catalog for the active locale (@suluk/i18n).
- `dir: "ltr" | "rtl"` (optional)
- `lang: string` (optional)
- `year: number` (optional)

### `OrderLine`
**Properties:**
- `name: string`
- `qty: number`
- `totalCents: number`

## audience

### `AudienceProvider`
The swappable audience binding — mirror contacts to an email-provider audience/list.
**Properties:**
- `id: string` — a stable id (e.g. "resend", "console").

### `AudienceContact`
Audience-sync (saastarter-parity Phase 3). The newsletter signup stores a subscriber (the MARKETING module's
`Newsletter` entity) AND mirrors it to the email provider's AUDIENCE/list (saastarter POSTs to Resend
`/audiences/{id}/contacts`, src/app/api/newsletter/route.ts:35-41). This is that mirror as a swappable binding:
a duck-typed `AudienceProvider` (consoleAudience for dev; a Workers-safe resendAudience over the REST API, no SDK)
+ a `syncNewsletter` reconciler that drives the audience from the `Newsletter` rows (subscribed → upsert,
unsubscribed → remove). Content the app SENDS to a provider — never a hosted list.
**Properties:**
- `email: string`
- `firstName: string` (optional)
- `lastName: string` (optional)
- `unsubscribed: boolean` (optional)

### `AudienceResult`
**Properties:**
- `ok: boolean`
- `id: string` (optional) — the provider's contact id, when upserted.
- `error: string` (optional)

### `NewsletterRow`
One newsletter subscriber row (the shape of the MARKETING module's `Newsletter` entity).
**Properties:**
- `email: string`
- `status: "subscribed" | "unsubscribed"` (optional)

### `SyncResult`
**Properties:**
- `upserted: number`
- `removed: number`
- `failed: number`
