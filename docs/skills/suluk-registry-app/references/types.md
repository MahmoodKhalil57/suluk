# Types & Enums

## app

### `Bindings`
**Properties:**
- `DB: D1Database`
- `TRUSTED_ORIGINS: string` (optional) — comma-separated allowlist of browser origins the API echoes on CORS (credentials:true, never "*"). Should match
 the `trustedOrigins` you pass to `mountAuthRoutes` — one source of truth.

### `App`
```ts
ReturnType<typeof createApp>
```
