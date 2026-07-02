# Types & Enums

## contract

### `RouteContract`
`@suluk/hono` — the derivation engine. The user authors minimal RouteContracts (Hono + Zod); everything
else is derived: the v4 document (dynamic per principal + time), request validation, contract tests, and
a documentation-coverage audit. See tooling/ARCHITECTURE.md. CANDIDATE tooling.
**Properties:**
- `method: Method`
- `path: string` — Hono-style path, e.g. "/pet/:petId" or "/files/*". Converted to a v4 uriTemplate on emit.
- `name: string` (optional) — The operation's v4 by-name handle (C009). Derived from method+path if omitted.
- `summary: string` (optional)
- `description: string` (optional)
- `tags: string[]` (optional)
- `deprecated: boolean` (optional)
- `deprecatedSince: string` (optional) — ISO date; with EmitContext.now, the operation is marked deprecated once now ≥ this.
- `removedSince: string` (optional) — ISO date; with EmitContext.now, the operation is HIDDEN once now ≥ this (the "when" axis).
- `security: SecurityRequirement[]` (optional) — Explicit by-name security requirements (C014).
- `scopes: string[]` (optional) — Required scopes. Drives BOTH the per-principal filter (the "who") and synthesized security.
- `errors: number[]` (optional) — Error statuses this operation can return. Synthesized into RFC-9457 error responses by emitV4 (alongside
the auto-derived 401/403 for auth-gated ops, 429 when rate-limited, and an always-present 500).
- `rateLimit: SulukRateLimit` (optional) — The declared rate budget (the `x-suluk-ratelimit` facet). emitV4 stamps it onto the operation + synthesizes a
429 response; @suluk/hono's enforceRateLimit middleware ENFORCES it on the wire. Advisory vendor extension.
- `request: RouteRequest` (optional)
- `responses: RouteResponse[] | Record<string, RouteResponse>` (optional) — Responses, as a list (each carries its own status) or a status-keyed map.
- `handler: (c: unknown) => unknown` (optional) — Optional live handler, used only by mount().

### `DocumentedRoute`
A route that satisfies documentation coverage at the TYPE level: it MUST carry a `summary` or a `description`. Used by
contractDoc so a route authored with neither fails to type-check.
```ts
RouteContract & ({ summary: string } | { description: string })
```

### `RouteRequest`
`@suluk/hono` — the derivation engine. The user authors minimal RouteContracts (Hono + Zod); everything
else is derived: the v4 document (dynamic per principal + time), request validation, contract tests, and
a documentation-coverage audit. See tooling/ARCHITECTURE.md. CANDIDATE tooling.
**Properties:**
- `params: ZodType<unknown, unknown, $ZodTypeInternals<unknown, unknown>>` (optional) — Path params (Hono `:name`), as a Zod object.
- `query: ZodType<unknown, unknown, $ZodTypeInternals<unknown, unknown>>` (optional) — Query string, as a Zod object.
- `header: ZodType<unknown, unknown, $ZodTypeInternals<unknown, unknown>>` (optional) — Request headers that participate in the contract, as a Zod object.
- `json: ZodType<unknown, unknown, $ZodTypeInternals<unknown, unknown>>` (optional) — Request body (defaults to application/json).
- `contentType: string` (optional) — Override the body media type.
- `examples: unknown[]` (optional) — Optional concrete example bodies — used by contractChecks to assert example⊨schema.

### `RouteResponse`
`@suluk/hono` — the derivation engine. The user authors minimal RouteContracts (Hono + Zod); everything
else is derived: the v4 document (dynamic per principal + time), request validation, contract tests, and
a documentation-coverage audit. See tooling/ARCHITECTURE.md. CANDIDATE tooling.
**Properties:**
- `status: number`
- `description: string` (optional)
- `schema: ZodType<unknown, unknown, $ZodTypeInternals<unknown, unknown>>` (optional)
- `contentType: string` (optional) — Defaults to application/json when a schema is present.
- `examples: unknown[]` (optional) — Optional concrete example responses — used by contractChecks.

### `Method`
`@suluk/hono` — the derivation engine. The user authors minimal RouteContracts (Hono + Zod); everything
else is derived: the v4 document (dynamic per principal + time), request validation, contract tests, and
a documentation-coverage audit. See tooling/ARCHITECTURE.md. CANDIDATE tooling.
```ts
"get" | "post" | "put" | "patch" | "delete" | "head" | "options"
```

## emit

### `EmitContext`
**Properties:**
- `info: Partial<Info>` (optional)
- `servers: Server[]` (optional)
- `principal: { scopes?: string[] }` (optional) — The "who": include only operations whose required scopes the principal holds. Omit ⇒ full public doc.
- `now: string | Date` (optional) — The "when": ISO date / Date. Drives deprecatedSince + removedSince. Omit ⇒ no time filtering.
- `securityScheme: string` (optional) — Name of the security scheme that `scopes` map onto (e.g. "bearerAuth"). Enables scopes→security.
- `securitySchemes: Record<string, SecurityScheme>` (optional) — Declared security schemes for components (C014).
- `includeDeprecated: boolean` (optional) — Include operations flagged deprecated (default true; they are marked, not hidden).
- `synthesizeErrors: boolean` (optional) — Synthesize RFC-9457 error responses (401/403 from access, 429 from a rate-limit facet, always-500, plus any
`route.errors`) + a shared `components.schemas.ProblemDetails`. Default true — the SDK's `isApiError` guard and
testgen's error-conformance need declared non-2xx responses to check. Set false for a success-only projection.

### `EmitResult`
**Properties:**
- `document: OpenAPIv4Document`
- `diagnostics: EmitDiagnostic[]`

### `EmitDiagnostic`
**Properties:**
- `kind: "collision" | "filtered" | "note"`
- `operation: string` (optional)
- `message: string`

## audit

### `Finding`
**Properties:**
- `code: string` — "missing-doc" | "no-success-schema" | "response-no-description" | "no-examples"
- `severity: "warn" | "info"`
- `path: string`
- `operation: string`
- `message: string`

## checks

### `Check`
**Properties:**
- `name: string`

### `CheckRun`
**Properties:**
- `total: number`
- `passed: number`
- `failures: { name: string; message?: string }[]`

## schema-check

### `SchemaCheck`
**Properties:**
- `valid: boolean`
- `errors: { path: string; message: string }[]`

## enforce

### `Guard`
**Properties:**
- `requireAuth: MiddlewareHandler` — 401 unless a verified principal is present.
- `requireAdmin: MiddlewareHandler` — 401 if anonymous, else 403 unless the caller is admin.
- `requireScopes: (need: string[]) => MiddlewareHandler` — 401 if anonymous, else 403 unless the caller holds EVERY named scope.

### `AccessFacet`
**Properties:**
- `requires: string` (optional)
- `scope: string` (optional)

### `AccessRequires`
```ts
"anyone" | "authenticated" | "admin"
```

## access

### `Rule`
A CRUD operation's authorization rule.
```ts
"any" | "owner" | "admin" | "none"
```

### `Policy`
The five CRUD operations' rules for one access mode.
**Properties:**
- `list: Rule`
- `get: Rule`
- `create: Rule`
- `update: Rule`
- `delete: Rule`

### `AccessMode`
The built-in access modes (a sensible SaaS/commerce default set; override via `policyFor`'s `policies` arg).
```ts
"public" | "admin" | "submit" | "owned" | "ownedAppend" | "ownedReadonly" | "review"
```

### `GateIdentity`
The resolved caller identity a gate decision needs (compute from your Hono Context: isAdmin flag + principal id).
**Properties:**
- `isAdmin: boolean`
- `principal: string | null`

### `GateDecision`
A gate decision: may the op run, scope the query to the owner, and — when denied — the honest status.
**Properties:**
- `ok: boolean`
- `scopeOwner: boolean`
- `status: 401 | 403` (optional)

## errors

### `SulukHttpErrorInit`
**Properties:**
- `detail: string` (optional) — the human-readable explanation (RFC-9457 `detail`).
- `instance: string` (optional) — a URI reference identifying the specific occurrence (RFC-9457 `instance`).
- `errors: Record<string, unknown>` (optional) — structured validation errors (saastarter's `details`).
- `type: string` (optional) — override the `type` URI (default "about:blank").
- `retryAfterMs: number` (optional) — RateLimitedError: ms until the window resets — drives the Retry-After header (route-handler.ts:75).
- `logContext: unknown` (optional) — server-only diagnostic context (cause/service/op) — LOGGED by onError, never sent on the wire.

## ratelimit

### `RateLimitStore`
The swap point for a durable counter. `consume` atomically records one hit for `key` under the budget and
reports whether it's now over. A production impl (KV / Durable Object) MUST be atomic-per-key; the in-memory
default is per-instance and NOT durable, so it is dev-only.

### `RateLimitResult`
**Properties:**
- `limited: boolean` — true ⇒ this request is OVER the budget and must be rejected.
- `remaining: number` — requests remaining in the window after this one (≥ 0).
- `retryAfterMs: number` — ms until the window resets — drives Retry-After. 0 when not limited.
