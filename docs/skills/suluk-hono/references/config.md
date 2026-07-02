# Configuration

## EnforceAccessConfig

Read identity from a request — the app supplies these (it owns its principal/scope model).

### Properties

#### operationOf

the operation name for this request, or undefined for non-contract paths (static/auth/docs → allowed).

**Type:** `(c: Context) => string | undefined`

**Required:** yes

#### accessOf

the declared access facet for an operation (e.g. from the document's x-suluk-access).

**Type:** `(operation: string) => AccessFacet | undefined`

**Required:** yes

#### defaultRequires

what an operation that declares NO access facet requires. Defaults to "authenticated" — DENY BY DEFAULT, so a
dropped/missing facet is a 401 in tests, NEVER a silent public route (a fail-open default is how an annotation
gap becomes a live breach). Mark genuinely-public ops explicitly `requires:"anyone"`.

**Type:** `AccessRequires`

#### principal

the caller's verified principal id, or null/undefined for anonymous.

**Type:** `(c: Context) => string | null | undefined`

**Required:** yes

#### isAdmin

fast-path admin check (verified). If omitted, the literal "admin" scope is used.

**Type:** `(c: Context) => boolean`

#### scopes

the caller's granted scopes (e.g. ["admin"], ["org:1:read"]). Default: none.

**Type:** `(c: Context) => string[] | undefined`

## IdentityConfig

Read identity from a request — the app supplies these (it owns its principal/scope model).

### Properties

#### principal

the caller's verified principal id, or null/undefined for anonymous.

**Type:** `(c: Context) => string | null | undefined`

**Required:** yes

#### isAdmin

fast-path admin check (verified). If omitted, the literal "admin" scope is used.

**Type:** `(c: Context) => boolean`

#### scopes

the caller's granted scopes (e.g. ["admin"], ["org:1:read"]). Default: none.

**Type:** `(c: Context) => string[] | undefined`

## OnErrorOptions

### Properties

#### log

sink for server-only diagnostics (defaults to console.error). Receives (message, context).

**Type:** `(message: string, context: unknown) => void`

## EnforceRateLimitConfig

### Properties

#### operationOf

Resolve the contract operation for a request (undefined ⇒ a non-contract path, passed through).

**Type:** `(c: Context) => string | undefined`

**Required:** yes

#### rateLimitOf

The declared rate budget for an operation (e.g. read off the document's `x-suluk-ratelimit`).

**Type:** `(operation: string) => SulukRateLimit | undefined`

**Required:** yes

#### store

The durable counter (default: a per-instance MemoryRateLimitStore — DEV ONLY).

**Type:** `RateLimitStore`

#### keyOf

Derive the caller key from a request + facet (default: client IP from x-forwarded-for / x-real-ip).

**Type:** `(c: Context, facet: SulukRateLimit) => string`

#### now

The clock (default: `Date.now`) — the single source of `now`.

**Type:** `() => number`

#### defaultFacet

A blanket budget applied to operations that declare none (escape hatch; default: unmetered).

**Type:** `SulukRateLimit`

## RateLimitConsumeOptions

### Properties

#### maxRequests

**Type:** `number`

**Required:** yes

#### windowMs

**Type:** `number`

**Required:** yes

#### now

the current epoch-ms, supplied by the middleware (the single clock owner).

**Type:** `number`

**Required:** yes