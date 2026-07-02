---
description: Reference tooling for the OpenAPI v4.0 Suluk candidate.
name: suluk-registry-auth
---

# suluk

Reference tooling for the OpenAPI v4.0 Suluk candidate.

## Configuration

**AuthOptions** (5 options — see references/config.md)

## Quick Reference

**auth:** `authDevMock` (LOCAL-DEV any-email login is armed only in dev-mock: NOT production AND no real Google key), `createAuth`, `identity` (Resolve the Better Auth session ONCE per `/api/*` request and stash the principal on the context (so routes read
`c), `mountAuthRoutes` (Mount Better Auth on your app: the caller-resolution middleware (`identity` session · `apiKeyAuth` · `mcpBearerAuth`) on
`/api/*` FIRST, then the `/api/auth/*` handler), `getCurrentUser` (Resolve the session user from the request headers), `currentUserLayer` (A `CurrentUser` layer for one request — provide it alongside your feature service layers), `CurrentUser`, `AuthEnv`, `AppVars` (Request-scoped identity, set by identity (session) or apiKeyAuth (an `x-api-key`)), `AppCtx`, `SessionUser`, `apiKeyAuth` (Programmatic auth via an `x-api-key` header (the api-key plugin) — when there is NO session, verify the key and stash its
OWNER + scopes + key id on the SAME slots a session sets, so a key caller reaches the metered API exactly like a user), `mcpBearerAuth` (The THIRD caller kind — an MCP OAuth bearer)
**auth.schema:** `user`, `session`, `account`, `verification`, `apikey`, `passkey`, `oauthApplication`, `oauthAccessToken`, `oauthConsent`
**auth.provision:** `authProvision`

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When using a class → read `references/classes.md` for properties, methods, and inheritance
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`
- When configuring options → read `references/config.md` for all settings and defaults