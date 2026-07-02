# Types & Enums

## auth

### `AuthEnv`
**Properties:**
- `DB: D1Database`
- `BETTER_AUTH_SECRET: string` (optional)
- `BETTER_AUTH_URL: string` (optional)
- `GOOGLE_CLIENT_ID: string` (optional)
- `GOOGLE_CLIENT_SECRET: string` (optional)
- `ENVIRONMENT: string` (optional) — "production" ⇒ real providers only; anything else (local dev) + no Google key ⇒ arm the any-email dev-login.

### `AppVars`
Request-scoped identity, set by identity (session) or apiKeyAuth (an `x-api-key`). `user` is the resolved
principal (rate-limit + routes read `c.get("user")`); `scopes` are its granted scopes; `keyId`/`keyName` are set ONLY for
a KEYED caller — their presence is how the scope gate tells a key call from a session call. Extend with `keyChain` etc.

### `AppCtx`

### `SessionUser`
**Properties:**
- `id: string`
- `email: string`
- `name: string` (optional)
