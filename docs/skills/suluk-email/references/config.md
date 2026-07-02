# Configuration

## ConsoleProviderOptions

`@suluk/email` — the missing EmailProvider binding + a per-event/per-locale branded template set. The app RENDERS
a message (pure, branded, localized via @suluk/i18n) and SENDS it through a swappable provider (consoleProvider in
dev; a Workers-safe resendProvider in prod). Never a hosted mailer — the provider is a thin binding (the
`@suluk/builder` `email` slot impl). CANDIDATE tooling.

### Properties

#### log

sink (default console.log) — receives a one-line summary, never sends.

**Type:** `(line: string, message: EmailMessage) => void`

## ResendProviderOptions

`@suluk/email` — the missing EmailProvider binding + a per-event/per-locale branded template set. The app RENDERS
a message (pure, branded, localized via @suluk/i18n) and SENDS it through a swappable provider (consoleProvider in
dev; a Workers-safe resendProvider in prod). Never a hosted mailer — the provider is a thin binding (the
`@suluk/builder` `email` slot impl). CANDIDATE tooling.

### Properties

#### apiKey

the Resend API key (the app pulls it from @suluk/env).

**Type:** `string`

**Required:** yes

#### from

default From, e.g. "Acme <noreply@acme.com>" — must be a verified Resend domain.

**Type:** `string`

**Required:** yes

#### fetch

inject a fetch (default: global fetch) — for testing / a custom transport.

**Type:** `typeof fetch`

#### costMicroUsd

advisory per-send cost in µ$ for @suluk/cost metering.

**Type:** `number`

## BrandedEmailOptions

### Properties

#### icon

header-banner icon (emoji or HTML entity).

**Type:** `string`

**Required:** yes

#### heading

**Type:** `string`

**Required:** yes

#### subheading

**Type:** `string`

#### body

the inner body HTML (placed inside the card).

**Type:** `string`

**Required:** yes

#### ctaLabel

**Type:** `string`

#### ctaUrl

**Type:** `string`

#### preheader

preview text (shown in the client's preview line, hidden in the body).

**Type:** `string`

## ConsoleAudienceOptions

### Properties

#### log

**Type:** `(line: string) => void`

## ResendAudienceOptions

### Properties

#### apiKey

the Resend API key (the app pulls it from @suluk/env).

**Type:** `string`

**Required:** yes

#### fetch

inject a fetch (default: global fetch) — for testing / a custom transport.

**Type:** `typeof fetch`