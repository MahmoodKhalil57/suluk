---
description: "The missing EmailProvider binding + a pure renderEmailHtml(options)→HTML generator with a per-event/per-locale branded template set (verify/reset/change-email/delete/order-confirmation/order-status/newsletter). Emits content the app SENDS — never a hosted mailer: consoleProvider (dev) + a Workers-safe resendProvider (REST, no SDK) are swappable bindings. Consumes @suluk/i18n for strings. CANDIDATE tooling."
name: suluk-email
---

# @suluk/email

The missing EmailProvider binding + a pure renderEmailHtml(options)→HTML generator with a per-event/per-locale branded template set (verify/reset/change-email/delete/order-confirmation/order-status/newsletter). Emits content the app SENDS — never a hosted mailer: consoleProvider (dev) + a Workers-safe resendProvider (REST, no SDK) are swappable bindings. Consumes @suluk/i18n for strings. CANDIDATE tooling.

## Quick Start

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

## Configuration

5 configuration interfaces — see references/config.md for details.

## Quick Reference

31 exports (15 functions, 14 types, 2 constants) — see references/ for full API.

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)