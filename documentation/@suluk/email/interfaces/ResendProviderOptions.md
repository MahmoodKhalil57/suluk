[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/email](../README.md) / ResendProviderOptions

# Interface: ResendProviderOptions

Defined in: [provider.ts:91](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/email/src/provider.ts#L91)

`@suluk/email` — the missing EmailProvider binding + a per-event/per-locale branded template set. The app RENDERS
a message (pure, branded, localized via @suluk/i18n) and SENDS it through a swappable provider (consoleProvider in
dev; a Workers-safe resendProvider in prod). Never a hosted mailer — the provider is a thin binding (the
`@suluk/builder` `email` slot impl). CANDIDATE tooling.

## Properties

### apiKey

> **apiKey**: `string`

Defined in: [provider.ts:93](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/email/src/provider.ts#L93)

the Resend API key (the app pulls it from @suluk/env).

***

### costMicroUsd?

> `optional` **costMicroUsd?**: `number`

Defined in: [provider.ts:99](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/email/src/provider.ts#L99)

advisory per-send cost in µ$ for @suluk/cost metering.

***

### fetch?

> `optional` **fetch?**: *typeof* `fetch`

Defined in: [provider.ts:97](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/email/src/provider.ts#L97)

inject a fetch (default: global fetch) — for testing / a custom transport.

***

### from

> **from**: `string`

Defined in: [provider.ts:95](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/email/src/provider.ts#L95)

default From, e.g. "Acme <noreply@acme.com>" — must be a verified Resend domain.
