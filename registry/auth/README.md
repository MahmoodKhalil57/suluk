# Auth — Better Auth mount + CurrentUser Effect service

The auth foundation every other Suluk module builds on: a parametrized Better Auth instance, its Hono mount, three
caller-resolution middlewares (session · api-key · MCP bearer), and a `CurrentUser` Effect service — owning the `user`
table (and the `apikey` table the `keys` module manages).

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for OpenAPI Specification v4.0
> ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable to ratify anything on the SIG's behalf.

## Install

```sh
pnpm dlx shadcn@latest add MahmoodKhalil57/suluk/auth
# pin to a ref:  MahmoodKhalil57/suluk/auth#main
```

`registryDependencies` pulls in the base [`app`](../app) module automatically (the Hono app + the Effect `Db` service).

## What you get

Three owned files drop into your app:

| file → target | what it is |
| --- | --- |
| `auth.ts` → `src/auth.ts` | the Better Auth config + mount + Effect service |
| `auth.schema.ts` → `src/db/auth.ts` | the Drizzle schema for the auth tables |
| `auth.provision.ts` → `provision/auth.ts` | the D1 migration fragment (`InstanceSpec[]`) |

**`src/auth.ts`** — the wiring, yours to edit:

- **`createAuth(env, opts?)`** — a cached (`WeakMap` per `DB` binding) Better Auth instance from `buildAuth`: the drizzle
  adapter over `auth.schema`, the `openAPI()` + `apiKey({ enableMetadata: true })` plugins, and — parametrized via
  `AuthOptions` — optional `passkey()`, Google social login (from env), an `onUserCreated` signup hook (the auth ↔
  `credits` seam — wire it to grant free credits), and the `mcp()` OAuth 2.1 authorization server.
- **`mountAuthRoutes(app, opts?)`** — attaches the three caller-resolution middlewares on `/api/*`, then the
  `/api/auth/*` handler:
  - **`identity(roleScopes?)`** — resolves the Better Auth session once per request and stashes the principal
    (`c.get("user")` + `scopes`); degrades to anonymous on failure (never 500s).
  - **`apiKeyAuth`** — verifies an `x-api-key` header and stashes its owner + scopes + `keyId`/`keyName` on the same
    context slots, so a key caller reaches the metered API exactly like a user.
  - **`mcpBearerAuth`** — resolves an `Authorization: Bearer <oauth-token>` through the `mcp()` plugin's `getMcpSession`
    (a no-op unless `opts.mcp` is set); the connection id flows through `keyId` as `mcp:<userId>:<clientId>`.
- **`CurrentUser`** (a `Context.Tag`) + **`currentUserLayer(env, headers, opts?)`** / **`getCurrentUser(...)`** — the
  session user as an Effect service you provide alongside your feature layers.
- Types `AuthEnv`, `AuthOptions`, `AppVars`, `AppCtx`, `SessionUser`, plus the `mcpConnectionKeyId` helper.

**`src/db/auth.ts`** — the owned Drizzle tables: `user`, `session`, `account`, `verification`, `apikey`, `passkey`, and
the OAuth 2.1 authorization-server tables `oauthApplication`, `oauthAccessToken`, `oauthConsent` (only needed when
`opts.mcp` is enabled). Reconciled against **Better Auth v1.6.23** — the schema is version + plugin dependent, so
regenerate with `npx @better-auth/cli generate` if you change plugins or bump the version.

**`provision/auth.ts`** — the `authProvision` fragment: two migrations (`0000_auth`, `0001_auth_oauth`) on the shared
`ref: "db"` D1 (`app-db`, `protected`), created first because the `user` table is what every other module references.
Merge it into your `provision.config.ts` and run `@suluk/provision` (`plan`/`apply`).

## Dependencies

**npm** (`dependencies`): `better-auth`, `@better-auth/api-key`, `@better-auth/passkey`,
[`@suluk/better-auth`](../../tooling/ts/packages/better-auth), `@suluk/provision`, `effect`, `hono`, `drizzle-orm`.

**registry** (`registryDependencies`): [`app`](../app).

## Own the wiring, npm the logic

Per the hybrid pattern (ADR C050/C052): you **own** the auth wiring — the `createAuth` config, the mount, the three
middlewares, the schema, and the provision fragment — all yours to edit.

The security-critical mapping flows from **`@suluk/better-auth`** upstream:

- **`principalFromSession`** — maps a Better Auth session (its role / permissions / apiKey scopes) to the `{ scopes }`
  principal that `@suluk/hono`'s per-viewer `emitV4` and the contract's scope gate read.
- **`verifyApiKey`** — wraps Better Auth's server `verifyApiKey` to return that **same** `{ scopes }` principal for key
  callers, so session and key callers are gated identically (including the double-stringified-metadata guard).

A correctness or scope-mapping fix lands via `npm update @suluk/better-auth` — the wiring stays yours.
