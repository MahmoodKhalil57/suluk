# Types & Enums

## email.service

### `EmailEnv`
The env vars the provider binding needs (declare these in your `wrangler`/`.dev.vars`).
**Properties:**
- `RESEND_API_KEY: string` (optional)
- `EMAIL_FROM: string` (optional)
- `BRAND_NAME: string` (optional)
- `BASE_URL: string` (optional)
- `ENVIRONMENT: string` (optional) — "production" ⇒ use Resend; anything else (or a missing key) ⇒ the console provider.
- `SULUK_MAILBOX_SINK: any` (optional) — LOCAL DEV ONLY — a mailbox sink injected by `src/dev.ts` (never present on the deployed Worker). When set AND no
 Resend key, emails are SAVED to it (an inspectable local inbox) instead of console-logged. Mock-until-keyed.
