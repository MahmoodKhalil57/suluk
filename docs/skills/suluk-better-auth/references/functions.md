# Functions

## security

### `authSecuritySchemes`
Build v4 securitySchemes from the enabled Better Auth methods.
```ts
authSecuritySchemes(methods: AuthMethods): AuthSecurity
```
**Parameters:**
- `methods: AuthMethods`
**Returns:** `AuthSecurity`

## ingest

### `normalizeOas30`
Recursively rewrite OpenAPI-3.0 Schema-Object dialect into JSON Schema 2020-12.
```ts
normalizeOas30(node: unknown): unknown
```
**Parameters:**
- `node: unknown`
**Returns:** `unknown`

### `ingestAuthOpenAPI`
Normalize + upgrade Better Auth's OpenAPI 3.0 schema to a v4 document (the auth surface).
```ts
ingestAuthOpenAPI(schema30: Record<string, unknown>, opts: IngestOptions): OpenAPIv4Document
```
**Parameters:**
- `schema30: Record<string, unknown>`
- `opts: IngestOptions` — default: `{}`
**Returns:** `OpenAPIv4Document`

### `mergeAuth`
Deep-merge auth paths + components (schemas + securitySchemes) into an app's v4 document.
```ts
mergeAuth(app: OpenAPIv4Document, auth: Partial<OpenAPIv4Document>, extra: { securitySchemes?: Record<string, SecurityScheme> }): OpenAPIv4Document
```
**Parameters:**
- `app: OpenAPIv4Document`
- `auth: Partial<OpenAPIv4Document>`
- `extra: { securitySchemes?: Record<string, SecurityScheme> }` — default: `{}`
**Returns:** `OpenAPIv4Document`

## principal

### `principalFromSession`
Extract a { scopes } principal from a Better Auth session. Null/undefined session ⇒ anonymous (no scopes).
Beyond the user/apiKey scopes, it encodes MFA + org state AS scopes (Phase 1): a 2FA-cleared session gains
`mfa:verified`, and each org membership contributes `org:<id>:<scope>` (explicit + role-mapped) — so a route
gates 2FA/tenancy through the same scope check enforceAccess already does, no richer Principal type required.
```ts
principalFromSession(session: SessionLike | null | undefined, opts: PrincipalOptions): Principal
```
**Parameters:**
- `session: SessionLike | null | undefined`
- `opts: PrincipalOptions` — default: `{}`
**Returns:** `Principal`

### `mcpConnectionKeyId`
The attributed-spend identity of an MCP bearer caller — `mcp:<userId>:<clientId>`. The SINGLE source shared by auth's
 `mcpBearerAuth` (which stamps it as the request `keyId`) and the `mcp` connection store, so they never drift + so `mcp`
 needs no `../auth` import.
```ts
mcpConnectionKeyId(userId: string, clientId: string): string
```
**Parameters:**
- `userId: string`
- `clientId: string`
**Returns:** `string`

### `orgScope`
Build the org-namespaced scope `org:<orgId>:<action>` (the tenancy encoding).
```ts
orgScope(orgId: string, action: string): string
```
**Parameters:**
- `orgId: string`
- `action: string`
**Returns:** `string`

### `parseOrgScope`
Parse an `org:<id>:<action>` scope back into its parts (null if it isn't one).
```ts
parseOrgScope(scope: string): { orgId: string; action: string } | null
```
**Parameters:**
- `scope: string`
**Returns:** `{ orgId: string; action: string } | null`

## mount

### `mountAuth`
Mount the Better Auth handler onto a Hono app under basePath/* (default /api/auth/*).
```ts
mountAuth<T>(app: T, auth: AuthHandlerLike, opts: MountAuthOptions): T
```
**Parameters:**
- `app: T`
- `auth: AuthHandlerLike`
- `opts: MountAuthOptions` — default: `{}`
**Returns:** `T`

## apikey

### `verifyApiKey`
Verify an API key (optionally requiring scopes) and return a `{ scopes }` Principal.

DEVIATION from saastarter (receipted): saastarter never derives IDENTITY from `verifyApiKey` — identity comes from
the session, and `verifyApiKey` is used ONLY to check scopes (services/auth.ts:133-147). Suluk's key-auth-only
path uses the verified key's `userId` + `permissions` AS the Principal — an invented composition for stateless API
callers that have no session. Result-returning (not throwing) to match the package idiom (preview.ts/principal.ts).
```ts
verifyApiKey(verifier: ApiKeyVerifierLike, key: string, opts: VerifyApiKeyOptions): Promise<VerifyApiKeyResult>
```
**Parameters:**
- `verifier: ApiKeyVerifierLike`
- `key: string`
- `opts: VerifyApiKeyOptions` — default: `{}`
**Returns:** `Promise<VerifyApiKeyResult>`

### `scopesToPermissions`
Flat scopes → Better Auth permissions. `["cart:read","cart:write"]` → `{ cart: ["read","write"] }`.
Ported from saastarter scopes.ts:150-161 — `split(":")` destructures only the first two segments, so a malformed
`"a:b:c"` yields `{ a: ["b"] }` and a segment-less `"x"` is skipped (no action). Faithful to saastarter semantics.
```ts
scopesToPermissions(scopes: string[]): Record<string, string[]>
```
**Parameters:**
- `scopes: string[]`
**Returns:** `Record<string, string[]>`

### `permissionsToScopes`
Better Auth permissions → flat scopes. `{ cart: ["read","write"] }` → `["cart:read","cart:write"]`.
DEVIATION from saastarter scopes.ts:167-179 (receipted): the `if (scope in API_SCOPES)` catalog filter is REMOVED.
The scope catalog is APP-domain vocabulary (saastarter's ecommerce products/cart/orders), not auth machinery —
baking a fixed catalog into a candidate-spec package would couple it to one app's domain. An app that wants
catalog-validation filters the result against its own catalog. Lowered ceiling: this is reusable-primitive intent,
not a behavioral port.
```ts
permissionsToScopes(perms: Record<string, string[]> | null | undefined): string[]
```
**Parameters:**
- `perms: Record<string, string[]> | null | undefined`
**Returns:** `string[]`

### `parseApiKeyMetadata`
Safely parse key metadata, handling Better Auth's potential DOUBLE-stringification of the JSON field.
Ported verbatim from saastarter metadata.ts:14-39 (the double-JSON.parse guard is load-bearing — without it a
double-stringified blob silently reads as a string, not the object).
```ts
parseApiKeyMetadata(raw: unknown): ApiKeyMetadata | null
```
**Parameters:**
- `raw: unknown`
**Returns:** `ApiKeyMetadata | null`

## erasure

### `beforeDeleteCascade`
Build the Better Auth `user.deleteUser.beforeDelete` hook (options.ts:127) from an ordered erasure cascade.
Runs each step in order; on a step error it logs and — unless `continueOnError` — rethrows to ABORT (so the user
is NOT deleted when cleanup failed, never orphaning their external records).
```ts
beforeDeleteCascade<U>(steps: CascadeStep<U>[], opts: CascadeOptions): (user: U) => Promise<void>
```
**Parameters:**
- `steps: CascadeStep<U>[]`
- `opts: CascadeOptions` — default: `{}`
**Returns:** `(user: U) => Promise<void>`

### `step`
A generic cascade step.
```ts
step<U>(name: string, run: (user: U) => void | Promise<void>): CascadeStep<U>
```
**Parameters:**
- `name: string`
- `run: (user: U) => void | Promise<void>`
**Returns:** `CascadeStep<U>`

### `anonymizeStep`
An ANONYMIZE step — keep the row, scrub its PII (the FK-safe posture; recommended default).
```ts
anonymizeStep<U>(name: string, run: (user: U) => void | Promise<void>): CascadeStep<U>
```
**Parameters:**
- `name: string`
- `run: (user: U) => void | Promise<void>`
**Returns:** `CascadeStep<U>`

### `deleteStep`
A hard-DELETE step — cascade-remove a subsystem's rows for the user.
```ts
deleteStep<U>(name: string, run: (user: U) => void | Promise<void>): CascadeStep<U>
```
**Parameters:**
- `name: string`
- `run: (user: U) => void | Promise<void>`
**Returns:** `CascadeStep<U>`

## auth-flow

### `isSafeRelativePath`
A path is safe to redirect to iff it's a SINGLE-leading-slash relative path (rejects "//host", "http(s)://…",
 backslash tricks, and protocol-relative URLs) — defends against open-redirect.
```ts
isSafeRelativePath(p: string | null | undefined): p is string
```
**Parameters:**
- `p: string | null | undefined`
**Returns:** `p is string`

### `resolveRedirectTo`
Read `redirectTo` from a query string / URLSearchParams; return it only if same-origin-relative, else `fallback`.
```ts
resolveRedirectTo(search: string | URLSearchParams, fallback: string): string
```
**Parameters:**
- `search: string | URLSearchParams`
- `fallback: string` — default: `"/"`
**Returns:** `string`

### `withRedirectTo`
Append a (guarded) `redirectTo` to an href — e.g. point "/login" at the page the user was on, so post-auth
 returns there. A non-safe target is dropped (the href is returned unchanged).
```ts
withRedirectTo(href: string, redirectTo: string | null | undefined): string
```
**Parameters:**
- `href: string`
- `redirectTo: string | null | undefined`
**Returns:** `string`

### `emailVerificationConfig`
A Better Auth `emailVerification` block with frictionless-activation defaults. Spread into
 `betterAuth({ emailVerification: emailVerificationConfig({ sendVerificationEmail }) })`.
```ts
emailVerificationConfig(opts: EmailVerificationOptions): { sendOnSignUp: boolean; autoSignInAfterVerification: boolean; sendVerificationEmail: (data: { user: { email: string }; url: string; token?: string }) => void | Promise<void> }
```
**Parameters:**
- `opts: EmailVerificationOptions`
**Returns:** `{ sendOnSignUp: boolean; autoSignInAfterVerification: boolean; sendVerificationEmail: (data: { user: { email: string }; url: string; token?: string }) => void | Promise<void> }`

## preview

### `previewLoginHandler`
Handle `GET /preview/login?role=…`. Fail-closed: 404 unless both locks pass; 403 for a role not in the
allow-list; else mint the seeded demo session and 302 to the app. Never throws on a hostile request.
```ts
previewLoginHandler(req: PreviewRequestLike, env: PreviewEnvLike, opts: PreviewLoginOptions): Promise<Response>
```
**Parameters:**
- `req: PreviewRequestLike`
- `env: PreviewEnvLike`
- `opts: PreviewLoginOptions`
**Returns:** `Promise<Response>`

### `isPreviewRuntime`
True iff BOTH independent locks say "preview". Exported so callers/tests can assert the gate in isolation.
```ts
isPreviewRuntime(env: PreviewEnvLike): boolean
```
**Parameters:**
- `env: PreviewEnvLike`
**Returns:** `boolean`

## dev-login

### `devLoginHandler`
Handle `POST /api/auth/dev-login` with `{ email }`. FAIL-CLOSED: 404 unless `armed` (checked before reading input);
400 for a missing/invalid email; else mint a real session for that email and return the sign-in Response (Set-Cookie).
Never throws on a hostile request.
```ts
devLoginHandler(opts: DevLoginOptions): Promise<Response>
```
**Parameters:**
- `opts: DevLoginOptions`
**Returns:** `Promise<Response>`
