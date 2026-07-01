[**Suluk**](../../README.md)

***

[Suluk](../../packages.md) / @suluk/better-auth

<p align="center">
  <a href="https://github.com/MahmoodKhalil57/suluk">
    <img src="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/wordmark.png" alt="Suluk" width="360" />
  </a>
</p>

<h1 align="center">@suluk/better-auth</h1>

<p align="center"><b>Wire Better Auth into the v4 contract — auth methods become <code>securitySchemes</code>, the session becomes a <code>principal</code>, and Better Auth's own OpenAPI surface is ingested, never re-typed.</b></p>

<p align="center">
  <em>Part of <a href="https://github.com/MahmoodKhalil57/suluk">Suluk</a> — one typed OpenAPI v4 contract projecting into every full-stack layer.</em>
</p>

---

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```sh
bun add @suluk/better-auth
```

`better-auth` and `hono` are optional peers — everything here is duck-typed, so you only need the ones
you actually use.

## What it does

[Better Auth](https://www.better-auth.com) is a **Contract input** (your auth settings). This package
reflects it into the Suluk v4 document and closes the per-viewer loop, without you re-typing the auth surface:

- **Auth methods → v4 `securitySchemes`** — `authSecuritySchemes({ session, bearer, apiKey, … })` derives the
  `components.securitySchemes` block (session-cookie, HTTP bearer, API-key header).
- **Better Auth's OpenAPI 3.0 → v4** — `ingestAuthOpenAPI` normalizes Better Auth's own
  `generateOpenAPISchema()` output to JSON Schema 2020-12, lifts it to v4 (via `@suluk/openapi-compat`), and
  `mergeAuth` folds the auth routes + schemes into your app's document. `/sign-up`, `/get-session`, … get
  documented for free.
- **Session → `{ scopes }` principal** — `principalFromSession` maps a Better Auth session (role, granted
  scopes, 2FA state, org memberships) to the `{ scopes }` shape `@suluk/hono`'s `emitV4(routes, { principal })`
  uses to project the doc each viewer is allowed to see. `verifyApiKey` produces the **same** shape for API-key
  callers, so enforcement is identical for sessions and keys.
- **Thin Hono mount + auth-flow plumbing** — `mountAuth` routes `/api/auth/*` to the Better Auth handler;
  helpers cover open-redirect-safe redirects, frictionless email verification, a GDPR erasure cascade, and a
  fail-closed role-preview login route.

## When to reach for it

Reach for it when your app uses Better Auth and you want **auth reflected in the contract** — its schemes and
its endpoints in the v4 doc — plus a **principal** that drives per-viewer projection and `@suluk/hono` access
enforcement. The session→principal shape is the seam many other packages key off; this is where it's produced.

Don't reach for it to *render* the doc (that's `@suluk/reference` / `@suluk/scalar` / `@suluk/swagger`) or to
build routes from entities (that's `@suluk/builder` / `@suluk/drizzle`). This package's job ends at handing
those layers a contract that already knows about auth, and a principal to scope it.

## Usage

### Reflect auth into the contract

The common case: derive the schemes, ingest Better Auth's own OpenAPI, and merge both into the app doc.

```ts
import { authSecuritySchemes, ingestAuthOpenAPI, mergeAuth } from "@suluk/better-auth";
import { auth } from "./auth"; // your betterAuth({ … }) instance, with the openAPI() plugin enabled

// 1. auth methods → v4 securitySchemes
const { securitySchemes } = authSecuritySchemes({ session: true, bearer: true, apiKey: true });

// 2. ingest Better Auth's own OpenAPI 3.0 surface, lifted to v4 and prefixed under its mount base
const authSchema = await auth.api.generateOpenAPISchema(); // OpenAPI 3.0
const authV4 = ingestAuthOpenAPI(authSchema, { basePath: "/api/auth" });

// 3. fold auth routes + schemes into your app's v4 document
const document = mergeAuth(appDocument, authV4, { securitySchemes });
// → document.paths now has "api/auth/sign-up/email", …; components.securitySchemes has sessionCookie/bearerAuth/apiKey
```

`authSecuritySchemes` also reports session-based plugins that add **no** new wire scheme but gate into the
session — `{ twoFactor, passkey, organization }` — via the returned `plugins` field.

### Close the per-viewer loop (session → principal)

```ts
import { principalFromSession } from "@suluk/better-auth";
import { emitV4 } from "@suluk/hono";

const session = await auth.api.getSession({ headers: req.headers });
const principal = principalFromSession(session, {
  roleScopes: { admin: ["read:*", "write:*"], user: ["read:self"] },
});

// @suluk/hono projects only the operations this viewer's scopes allow
const { document } = emitV4(routes, { principal });
```

`principalFromSession` also encodes plugin state **as scopes**: a 2FA-cleared session gains `mfa:verified`
(the exported `MFA_SCOPE`), and each org membership contributes `org:<id>:<scope>` scopes (build/parse them with
`orgScope` / `parseOrgScope`) — so 2FA and tenancy gate through the same scope check `@suluk/hono` already runs.

### Scope-aware API-key verification

Give API-key callers the **same** `{ scopes }` principal as sessions, so `@suluk/hono`'s `createGuard` /
`enforceAccess` works for keys too:

```ts
import { verifyApiKey } from "@suluk/better-auth";

const result = await verifyApiKey(auth.api, key, { requireScopes: ["orders:read"] });
if (!result.ok) {
  // result.reason is "invalid" | "insufficient_scope" | "error"
  return new Response("unauthorized", { status: 401 });
}
result.principal; // { scopes: ["orders:read", …] } — feed this to @suluk/hono
result.key;       // { id, userId, name, metadata } — metadata parsed past Better Auth's double-stringification
```

`scopesToPermissions` / `permissionsToScopes` convert between flat `"cart:read"` scopes and Better Auth's
`{ cart: ["read"] }` permission shape.

### Mount the handler on Hono

```ts
import { mountAuth } from "@suluk/better-auth";
import { Hono } from "hono";

const app = new Hono();
mountAuth(app, auth); // routes POST/GET /api/auth/* → auth.handler(c.req.raw)
```

### Auth-flow UX: redirects + frictionless verification

```ts
import {
  resolveRedirectTo, withRedirectTo, isSafeRelativePath, emailVerificationConfig,
} from "@suluk/better-auth";

resolveRedirectTo(location.search);        // read ?redirectTo, honored only if same-origin-relative (open-redirect-safe)
withRedirectTo("/login", "/dashboard");    // "/login?redirectTo=%2Fdashboard" — return here post-auth

// spread into betterAuth({ emailVerification: … }) — verify-on-sign-up + auto-sign-in after, by default
const emailVerification = emailVerificationConfig({
  sendVerificationEmail: async ({ user, url }) => { await sendVerifyEmail(user.email, url); },
});
```

### GDPR erasure cascade

`beforeDeleteCascade` builds Better Auth's `user.deleteUser.beforeDelete` hook from an ordered list of steps.
The package orchestrates; you supply the steps and pick the posture (`deleteStep` hard-deletes, `anonymizeStep`
scrubs PII, `step` is generic). Fail-closed by default — a failed cleanup aborts the delete so no rows are orphaned.

```ts
import { betterAuth } from "better-auth";
import { beforeDeleteCascade, deleteStep } from "@suluk/better-auth";

const steps = [
  deleteStep("orders", (user) => db.delete(orders).where(eq(orders.customerId, user.id)).run()),
  deleteStep("apiTokens", (user) => db.delete(apiToken).where(eq(apiToken.userId, user.id)).run()),
];

betterAuth({
  user: { deleteUser: { enabled: true, beforeDelete: beforeDeleteCascade(steps) } },
});
```

### Role-preview login (the one credentialed surface)

`previewLoginHandler` mints a role-scoped session for the seeded demo user, for the generated preview Worker —
fail-closed behind two independent locks (`env.SULUK_PREVIEW === "1"` **and** an `env.PREVIEW_DB` binding;
absence of either ⇒ 404). The role comes from a server-side allow-list, never a client header.

```ts
import { previewLoginHandler } from "@suluk/better-auth";

// inside the preview Worker, for GET /preview/login?role=…
return previewLoginHandler(request, env, {
  allowedRoles: ["user", "admin"],          // from the contract's preview roles, NEVER hardcoded loosely
  mintSession: (role) => mintDemoSession(role), // binds to a seeded throwaway demo user for `role`
});
```

## API

| Export | What it does |
| --- | --- |
| `authSecuritySchemes(methods)` | Auth methods → v4 `securitySchemes` + the enabled session-plugins (`AuthMethods` → `AuthSecurity`). |
| `ingestAuthOpenAPI(schema30, opts?)` | Normalize Better Auth's OpenAPI 3.0 to 2020-12 and lift it to a v4 document. |
| `normalizeOas30(node)` | Rewrite 3.0 Schema dialect (`nullable`, boolean `exclusiveMin/Max`) into JSON Schema 2020-12. |
| `mergeAuth(app, auth, extra?)` | Deep-merge auth paths + schemas + `securitySchemes` into the app's v4 document. |
| `principalFromSession(session, opts?)` | Better Auth session → `{ scopes }` `Principal` (role, scopes, MFA, org). |
| `MFA_SCOPE`, `orgScope`, `parseOrgScope` | The `mfa:verified` scope + build/parse `org:<id>:<scope>` tenancy scopes. |
| `verifyApiKey(verifier, key, opts?)` | Verify an API key (optionally `requireScopes`) → the same `{ scopes }` `Principal`. |
| `scopesToPermissions` / `permissionsToScopes` | Convert between flat `"a:b"` scopes and Better Auth's `{ a: ["b"] }` permissions. |
| `parseApiKeyMetadata(raw)` | Parse key metadata past Better Auth's double-stringification quirk. |
| `beforeDeleteCascade(steps, opts?)` | Build the `beforeDelete` hook from an ordered, fail-closed erasure cascade. |
| `step` / `anonymizeStep` / `deleteStep` | Cascade-step constructors (generic / scrub-PII / hard-delete). |
| `isSafeRelativePath` / `resolveRedirectTo` / `withRedirectTo` | Open-redirect-safe `redirectTo` preservation. |
| `emailVerificationConfig(opts)` | A Better Auth `emailVerification` block with frictionless-activation defaults. |
| `mountAuth(app, auth, opts?)` | Mount the Better Auth handler onto a Hono app under `basePath/*`. |
| `previewLoginHandler(req, env, opts)` / `isPreviewRuntime(env)` | Fail-closed role-preview login + its two-lock gate check. |

## Boundary

This package **reflects and reads** Better Auth — it never becomes the auth runtime. Better Auth owns sessions,
storage, and the credential flows; Suluk turns its configuration into a v4 contract and a scope-bearing principal.
The seams are injected, not assumed: `mountAuth` / `verifyApiKey` are duck-typed against `auth.handler` /
`auth.api` (no hard `better-auth` or `hono` import); `beforeDeleteCascade` takes the steps that touch *your* db;
`previewLoginHandler` takes the `mintSession` that owns the session lookup. The session→principal **shape** is a
stable contract many other `@suluk/*` packages depend on — extend the method→scheme and session→scope mappings,
but keep that shape steady. Rendering the resulting doc, and hosting the auth itself, stay outside this line.

## License

Apache-2.0

## Interfaces

- [ApiKeyMetadata](interfaces/ApiKeyMetadata.md)
- [ApiKeyVerifierLike](interfaces/ApiKeyVerifierLike.md)
- [AuthHandlerLike](interfaces/AuthHandlerLike.md)
- [AuthMethods](interfaces/AuthMethods.md)
- [AuthSecurity](interfaces/AuthSecurity.md)
- [CascadeOptions](interfaces/CascadeOptions.md)
- [CascadeStep](interfaces/CascadeStep.md)
- [DevLoginAuthLike](interfaces/DevLoginAuthLike.md)
- [DevLoginOptions](interfaces/DevLoginOptions.md)
- [EmailVerificationOptions](interfaces/EmailVerificationOptions.md)
- [HonoLike](interfaces/HonoLike.md)
- [IngestOptions](interfaces/IngestOptions.md)
- [MintedSession](interfaces/MintedSession.md)
- [MountAuthOptions](interfaces/MountAuthOptions.md)
- [PreviewEnvLike](interfaces/PreviewEnvLike.md)
- [PreviewLoginOptions](interfaces/PreviewLoginOptions.md)
- [PreviewRequestLike](interfaces/PreviewRequestLike.md)
- [Principal](interfaces/Principal.md)
- [PrincipalOptions](interfaces/PrincipalOptions.md)
- [SessionLike](interfaces/SessionLike.md)
- [VerifiedKey](interfaces/VerifiedKey.md)
- [VerifyApiKeyOptions](interfaces/VerifyApiKeyOptions.md)
- [VerifyApiKeyResult](interfaces/VerifyApiKeyResult.md)

## Type Aliases

- [VerifyReason](type-aliases/VerifyReason.md)

## Variables

- [DEV\_LOGIN\_PASSWORD](variables/DEV_LOGIN_PASSWORD.md)
- [MFA\_SCOPE](variables/MFA_SCOPE.md)

## Functions

- [anonymizeStep](functions/anonymizeStep.md)
- [authSecuritySchemes](functions/authSecuritySchemes.md)
- [beforeDeleteCascade](functions/beforeDeleteCascade.md)
- [deleteStep](functions/deleteStep.md)
- [devLoginHandler](functions/devLoginHandler.md)
- [emailVerificationConfig](functions/emailVerificationConfig.md)
- [ingestAuthOpenAPI](functions/ingestAuthOpenAPI.md)
- [isPreviewRuntime](functions/isPreviewRuntime.md)
- [isSafeRelativePath](functions/isSafeRelativePath.md)
- [mergeAuth](functions/mergeAuth.md)
- [mountAuth](functions/mountAuth.md)
- [normalizeOas30](functions/normalizeOas30.md)
- [orgScope](functions/orgScope.md)
- [parseApiKeyMetadata](functions/parseApiKeyMetadata.md)
- [parseOrgScope](functions/parseOrgScope.md)
- [permissionsToScopes](functions/permissionsToScopes.md)
- [previewLoginHandler](functions/previewLoginHandler.md)
- [principalFromSession](functions/principalFromSession.md)
- [resolveRedirectTo](functions/resolveRedirectTo.md)
- [scopesToPermissions](functions/scopesToPermissions.md)
- [step](functions/step.md)
- [verifyApiKey](functions/verifyApiKey.md)
- [withRedirectTo](functions/withRedirectTo.md)
