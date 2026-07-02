# Functions

## contract

### `contract`
Identity helper that preserves literal inference when authoring a contract array.
```ts
contract<T>(routes: T): T
```
**Parameters:**
- `routes: T`
**Returns:** `T`

### `contractDoc`
Stricter, OPT-IN variant of contract: identical runtime behavior + literal inference, but every route must be
DOCUMENTED (a `summary` or `description`) or it fails to type-check at the contract site — lifting the doc-coverage
audit (`audit()`'s `missing-doc` finding) into the type system, so an undocumented operation is a red squiggle, not a
CI warning. `contract()` stays UNCHANGED (some callers author docs separately / exercise the advisory audit); adopt
`contractDoc` where you want documentation enforced as you type.
```ts
contractDoc<T>(routes: T): T
```
**Parameters:**
- `routes: T`
**Returns:** `T`

### `responseList`
Normalize responses (list or map) to a list.
```ts
responseList(r: RouteResponse[] | Record<string, RouteResponse> | undefined): RouteResponse[]
```
**Parameters:**
- `r: RouteResponse[] | Record<string, RouteResponse> | undefined`
**Returns:** `RouteResponse[]`

## emit

### `emitV4`
Project a list of route contracts into a v4 document for a given principal + time.
- WHEN: removedSince ≤ now ⇒ hidden; deprecatedSince ≤ now ⇒ marked deprecated.
- WHO: if a principal is supplied, an operation requiring scopes the principal lacks is omitted.
```ts
emitV4(routes: readonly RouteContract[], ctx: EmitContext): EmitResult
```
**Parameters:**
- `routes: readonly RouteContract[]`
- `ctx: EmitContext` — default: `{}`
**Returns:** `EmitResult`

## audit

### `audit`
Walk every operation and report documentation gaps.
```ts
audit(doc: OpenAPIv4Document): Finding[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `Finding[]`

### `coverage`
A coarse coverage score in [0,1]: 1 = fully documented (no findings), lower = more gaps.
```ts
coverage(doc: OpenAPIv4Document): number
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `number`

### `autofill`
Fill obvious documentation gaps in-place-safe (returns a new doc): synthesize a summary from the
operation name + method/path, and a description for undescribed responses. Conservative — never
overwrites authored text. This is the "automatically document under-documented routes" lever.
```ts
autofill(doc: OpenAPIv4Document): OpenAPIv4Document
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `OpenAPIv4Document`

## checks

### `contractChecks`
Build the full check suite for a set of route contracts.
```ts
contractChecks(routes: readonly RouteContract[]): Check[]
```
**Parameters:**
- `routes: readonly RouteContract[]`
**Returns:** `Check[]`

### `runContractChecks`
Run every check and summarize.
```ts
runContractChecks(routes: readonly RouteContract[]): CheckRun
```
**Parameters:**
- `routes: readonly RouteContract[]`
**Returns:** `CheckRun`

## schema-check

### `validateSchema2020`
```ts
validateSchema2020(schema: unknown): SchemaCheck
```
**Parameters:**
- `schema: unknown`
**Returns:** `SchemaCheck`

## mount

### `mount`
Mount each contract's handler (with request validation derived from its Zod schemas) onto `app`.
```ts
mount<T>(app: T, routes: readonly RouteContract[]): T
```
**Parameters:**
- `app: T`
- `routes: readonly RouteContract[]`
**Returns:** `T`

## enforce

### `enforceAccess`
The facet-driven gate. Apply once (after identity is resolved, before the handlers): every operation is then
enforced at the level its `x-suluk-access` declares. FAIL-CLOSED throughout — a missing facet denies (deny-by-
default), an unknown/mis-cased `requires` denies, and a non-owner `scope` is enforced even when `requires` is
"anyone" (a named scope implies authentication). Non-contract paths (operationOf → undefined) pass untouched;
a consumer's operationOf MUST be at least as strict as the router and MUST fail closed if it can't resolve.
```ts
enforceAccess(cfg: EnforceAccessConfig): MiddlewareHandler
```
**Parameters:**
- `cfg: EnforceAccessConfig`
**Returns:** `MiddlewareHandler`

### `createGuard`
Build explicit, hand-applied guards bound to one identity model (for fine-grained per-route gating).
```ts
createGuard(cfg: IdentityConfig): Guard
```
**Parameters:**
- `cfg: IdentityConfig`
**Returns:** `Guard`

## access

### `gate`
Decide whether a caller may run an op (per the rule), whether to scope the query to their own rows, and the honest
deny status. FAIL-CLOSED: an `owner` op with no principal is 401 (the wire must enforce what `x-suluk-access`
claims — a null-scoped empty 200 would let the facet lie); `admin` with no principal is 401, signed-in-non-admin is
403; `none` hard-denies 403. A signed-in owner is scoped to their rows; an admin sees all.
```ts
gate(rule: Rule, id: GateIdentity): GateDecision
```
**Parameters:**
- `rule: Rule`
- `id: GateIdentity`
**Returns:** `GateDecision`

### `policyFor`
The policy for an access mode (default: owned when an ownerCol is present, else public). `policies` overrides the preset.
```ts
policyFor(access: AccessMode | undefined, ownerCol?: string, policies: Record<AccessMode, Policy>): Policy
```
**Parameters:**
- `access: AccessMode | undefined`
- `ownerCol: string` (optional)
- `policies: Record<AccessMode, Policy>` — default: `DEFAULT_POLICIES`
**Returns:** `Policy`

### `ruleToRequires`
```ts
ruleToRequires(rule: Rule): AccessRequires
```
**Parameters:**
- `rule: Rule`
**Returns:** `AccessRequires`

## on-error

### `onError`
Build the Hono error handler. Every response carries `content-type: application/problem+json`.
```ts
onError(opts: OnErrorOptions): ErrorHandler
```
**Parameters:**
- `opts: OnErrorOptions` — default: `{}`
**Returns:** `ErrorHandler`

## ratelimit

### `enforceRateLimit`
The facet-driven rate-limit gate. Apply once (typically after identity, alongside enforceAccess): every operation
that DECLARES an `x-suluk-ratelimit` budget is metered; the rest pass untouched. On overflow → 429 + Retry-After.
```ts
enforceRateLimit(cfg: EnforceRateLimitConfig): MiddlewareHandler
```
**Parameters:**
- `cfg: EnforceRateLimitConfig`
**Returns:** `MiddlewareHandler`
