[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / AuthSecurity

# Interface: AuthSecurity

Defined in: [security.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/better-auth/src/security.ts#L26)

`@suluk/better-auth` — official Better-Auth-on-Hono support for the Suluk derivation engine.

Better Auth is a Contract input (auth settings). This package: (1) derives v4 securitySchemes from the
enabled auth methods; (2) ingests Better Auth's own OpenAPI 3.0 output (normalizing it to 2020-12) and
lifts it to v4 via @suluk/openapi-compat, then merges it into the app doc — so the auth surface is
documented without re-typing; (3) maps a Better Auth session to a { scopes } principal that feeds
`@suluk/hono`'s per-viewer emitV4; (4) mounts the auth handler on Hono. CANDIDATE tooling.

## Properties

### names

> **names**: `string`[]

Defined in: [security.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/better-auth/src/security.ts#L30)

Convenience: the scheme names, to build by-name security requirements.

***

### plugins

> **plugins**: `object`

Defined in: [security.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/better-auth/src/security.ts#L32)

Enabled session-based plugins (NOT wire schemes — they gate into the session via scope-encoding).

#### organization

> **organization**: `boolean`

#### passkey

> **passkey**: `boolean`

#### twoFactor

> **twoFactor**: `boolean`

***

### securitySchemes

> **securitySchemes**: `Record`\<`string`, [`SecurityScheme`](../../core/interfaces/SecurityScheme.md)\>

Defined in: [security.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/better-auth/src/security.ts#L28)

v4 components.securitySchemes entries, keyed by scheme name.
