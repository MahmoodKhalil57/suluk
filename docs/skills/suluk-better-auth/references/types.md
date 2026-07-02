# Types & Enums

## security

### `AuthMethods`
`@suluk/better-auth` — official Better-Auth-on-Hono support for the Suluk derivation engine.

Better Auth is a Contract input (auth settings). This package: (1) derives v4 securitySchemes from the
enabled auth methods; (2) ingests Better Auth's own OpenAPI 3.0 output (normalizing it to 2020-12) and
lifts it to v4 via @suluk/openapi-compat, then merges it into the app doc — so the auth surface is
documented without re-typing; (3) maps a Better Auth session to a { scopes } principal that feeds
`@suluk/hono`'s per-viewer emitV4; (4) mounts the auth handler on Hono. CANDIDATE tooling.
**Properties:**
- `session: boolean | { cookieName?: string }` (optional) — Session cookie (default). `true` ⇒ default cookie name; or pass a custom cookie name.
- `bearer: boolean` (optional) — Bearer token (the bearer plugin).
- `apiKey: boolean | { header?: string }` (optional) — API key (the apiKey plugin). `true` ⇒ default "x-api-key" header; or pass a custom header.
- `twoFactor: boolean` (optional) — twoFactor plugin — MFA on top of the session (no new wire scheme; gates via the `mfa:verified` scope).
- `passkey: boolean` (optional) — passkey (WebAuthn) plugin — a credential method that authenticates INTO a session (no new wire scheme).
- `organization: boolean` (optional) — organization plugin — multi-tenancy via `org:<id>:<scope>` scopes (no new wire scheme).

### `AuthSecurity`
`@suluk/better-auth` — official Better-Auth-on-Hono support for the Suluk derivation engine.

Better Auth is a Contract input (auth settings). This package: (1) derives v4 securitySchemes from the
enabled auth methods; (2) ingests Better Auth's own OpenAPI 3.0 output (normalizing it to 2020-12) and
lifts it to v4 via @suluk/openapi-compat, then merges it into the app doc — so the auth surface is
documented without re-typing; (3) maps a Better Auth session to a { scopes } principal that feeds
`@suluk/hono`'s per-viewer emitV4; (4) mounts the auth handler on Hono. CANDIDATE tooling.
**Properties:**
- `securitySchemes: Record<string, SecurityScheme>` — v4 components.securitySchemes entries, keyed by scheme name.
- `names: string[]` — Convenience: the scheme names, to build by-name security requirements.
- `plugins: { twoFactor: boolean; passkey: boolean; organization: boolean }` — Enabled session-based plugins (NOT wire schemes — they gate into the session via scope-encoding).

## principal

### `Principal`
The principal extractor — the loop-closer for per-viewer docs. A Better Auth session (its user role,
granted permissions, or an apiKey's scopes) is mapped to a { scopes } principal that @suluk/hono's
emitV4(routes, { principal }) uses to project the doc each viewer is allowed to see.
**Properties:**
- `scopes: string[]`

### `SessionLike`
A minimal view of a Better Auth session (duck-typed; works with the real Session shape).
**Properties:**
- `user: { role?: string | string[]; scopes?: string[] } | null` (optional)
- `apiKey: { scopes?: string[]; permissions?: Record<string, string[]> } | null` (optional) — apiKey plugin: a key carries its own permissions/scopes.
- `scopes: string[]` (optional)
- `twoFactorVerified: boolean` (optional) — twoFactor plugin: the session has cleared its second factor ⇒ the `mfa:verified` scope (Phase 1).
- `organizations: { id: string; role?: string; scopes?: string[] }[]` (optional) — organization plugin: memberships → `org:<id>:<scope>` scopes (Phase 1, tenancy via scope-encoding).

## mount

### `AuthHandlerLike`
mountAuth — the thin Hono adapter for Better Auth (the documented integration:
app.on(["POST","GET"], "/api/auth/*", c => auth.handler(c.req.raw))). Duck-typed so it needs neither a
hard better-auth nor hono import — it only relies on app.on(...) and auth.handler(Request).

### `HonoLike`

## apikey

### `ApiKeyVerifierLike`
A duck-typed view of Better Auth's server `verifyApiKey` (the app injects `betterAuth.api`).

### `VerifyApiKeyResult`
**Properties:**
- `ok: boolean`
- `reason: VerifyReason` (optional) — why verification failed (absent on success).
- `principal: Principal` (optional) — the `{ scopes }` Principal — the SAME shape principalFromSession returns, so enforceAccess works identically.
- `key: VerifiedKey` (optional)

### `VerifiedKey`
The verified key's identity surface (metadata parsed via the double-stringification guard).
**Properties:**
- `id: string` (optional)
- `userId: string` (optional)
- `name: string` (optional)
- `metadata: ApiKeyMetadata | null`

### `VerifyReason`
```ts
"invalid" | "insufficient_scope" | "error"
```

### `ApiKeyMetadata`
Metadata stored on a key for delegation tracking (saastarter metadata.ts:4-8).
**Properties:**
- `parentKeyId: string` (optional)
- `parentKeyName: string` (optional)
- `createdVia: "delegation"` (optional)

## erasure

### `CascadeStep`
One step of the erasure cascade — the erasure of one subsystem for one user.
**Properties:**
- `name: string` — a label for logs/diagnostics.
- `run: (user: U) => void | Promise<void>` — perform the erasure. Put any in-step recovery (already-deleted → fallback) HERE, not in the orchestrator.

## preview

### `PreviewRequestLike`
A minimal view of the Worker request — only `.url` (to read the `role` query param) is needed. Web `Request` satisfies it.
**Properties:**
- `url: string`

### `PreviewEnvLike`
The two independent locks live on the Worker env: a var and a binding. Duck-typed; extra keys ignored.
**Properties:**
- `SULUK_PREVIEW: string` (optional) — lock 1 — the deploy-time preview flag.
- `PREVIEW_DB: unknown` (optional) — lock 2 — a D1 binding only the preview deploy declares (presence is the lock; we never read prod's DB here).

### `MintedSession`
What a successful mint returns: the headers to set on the redirect (e.g. the session Set-Cookie).
**Properties:**
- `setCookie: string`

## dev-login

### `DevLoginAuthLike`
The Better Auth surface this needs — its public `signUpEmail`/`signInEmail` server endpoints. Duck-typed.
**Properties:**
- `api: { signUpEmail: any; signInEmail: any }`
