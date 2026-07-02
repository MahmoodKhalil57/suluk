[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / AuthMethods

# Interface: AuthMethods

Defined in: [security.ts:11](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/better-auth/src/security.ts#L11)

`@suluk/better-auth` — official Better-Auth-on-Hono support for the Suluk derivation engine.

Better Auth is a Contract input (auth settings). This package: (1) derives v4 securitySchemes from the
enabled auth methods; (2) ingests Better Auth's own OpenAPI 3.0 output (normalizing it to 2020-12) and
lifts it to v4 via @suluk/openapi-compat, then merges it into the app doc — so the auth surface is
documented without re-typing; (3) maps a Better Auth session to a { scopes } principal that feeds
`@suluk/hono`'s per-viewer emitV4; (4) mounts the auth handler on Hono. CANDIDATE tooling.

## Properties

### apiKey?

> `optional` **apiKey?**: `boolean` \| \{ `header?`: `string`; \}

Defined in: [security.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/better-auth/src/security.ts#L17)

API key (the apiKey plugin). `true` ⇒ default "x-api-key" header; or pass a custom header.

***

### bearer?

> `optional` **bearer?**: `boolean`

Defined in: [security.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/better-auth/src/security.ts#L15)

Bearer token (the bearer plugin).

***

### organization?

> `optional` **organization?**: `boolean`

Defined in: [security.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/better-auth/src/security.ts#L23)

organization plugin — multi-tenancy via `org:<id>:<scope>` scopes (no new wire scheme).

***

### passkey?

> `optional` **passkey?**: `boolean`

Defined in: [security.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/better-auth/src/security.ts#L21)

passkey (WebAuthn) plugin — a credential method that authenticates INTO a session (no new wire scheme).

***

### session?

> `optional` **session?**: `boolean` \| \{ `cookieName?`: `string`; \}

Defined in: [security.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/better-auth/src/security.ts#L13)

Session cookie (default). `true` ⇒ default cookie name; or pass a custom cookie name.

***

### twoFactor?

> `optional` **twoFactor?**: `boolean`

Defined in: [security.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/better-auth/src/security.ts#L19)

twoFactor plugin — MFA on top of the session (no new wire scheme; gates via the `mfa:verified` scope).
