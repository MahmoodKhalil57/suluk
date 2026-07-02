# Functions

## parse

### `parseDocument`
Parse a Suluk v4 document from YAML or JSON source text. (YAML is a superset; JSON parses as YAML too.)
```ts
parseDocument(source: string): OpenAPIv4Document
```
**Parameters:**
- `source: string`
**Returns:** `OpenAPIv4Document`

## validate

### `validateDocument`
Validate a document's STRUCTURE against the v4 meta-schema (SPEC §1, ADRs C003/C004/C009/C013).

Uses a PRECOMPILED (ajv-standalone) validator (src/validate.standalone.js) — a plain function, no
`new Function`/eval — so @suluk/core validates on Cloudflare Workers (the deploy target forbids dynamic
code generation) and starts instantly. Regenerate with `bun run scripts/gen-validator.ts`. It does NOT
validate the inner JSON Schema 2020-12 Schema Objects (those are the 2020-12 dialect's concern).
```ts
validateDocument(doc: unknown): ValidationResult
```
**Parameters:**
- `doc: unknown`
**Returns:** `ValidationResult`

### `isValidDocument`
Type guard: a parsed doc that validates is treated as an OpenAPIv4Document.
```ts
isValidDocument(doc: unknown): doc is OpenAPIv4Document
```
**Parameters:**
- `doc: unknown`
**Returns:** `doc is OpenAPIv4Document`

## reference

### `isReference`
Structural guard for an OpenAPI Reference Object (C019 §A.1). NOTE: a JSON Schema may also carry a
 `$ref` keyword; in Schema-Object position the slot+token rule (C019) decides — this is the structural test.
```ts
isReference(x: unknown): x is Reference
```
**Parameters:**
- `x: unknown`
**Returns:** `x is Reference`

### `resolveRef`
Resolve a same-document OpenAPI reference "#/components/<type>/<name>" BY NAME (C019 §A.1, C009).
Each pointer token is a map KEY (O(1) by-name); MUST throw if a key is absent; NEVER falls back to
positional/order lookup. Returns the referenced target. (Cross-document imports — C013 #72 — are not
yet implemented; a bare "#/..." is always same-document.)
```ts
resolveRef(doc: OpenAPIv4Document, ref: string): unknown
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `ref: string`
**Returns:** `unknown`

### `deref`
Resolve a value that may itself be a Reference (one hop). Returns the value unchanged if it is not a Reference.
```ts
deref<T>(doc: OpenAPIv4Document, value: Reference | T): T
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `value: Reference | T`
**Returns:** `T`

## source

### `sourceIndex`
The DERIVED reverse index: source pointer → the operations projected from it. Computed by walking the document;
never read back from stored doc state. One authored symbol (a Drizzle table, an operation function) typically
fans out to several operations (a table → its 5 CRUD ops), so this is the "what does this source drive?" lookup.
```ts
sourceIndex(doc: OpenAPIv4Document): SourceGroup[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `SourceGroup[]`

### `sourceCoverage`
Count of operations carrying a source pointer vs total — the provenance-coverage gauge.
```ts
sourceCoverage(doc: OpenAPIv4Document): { stamped: number; total: number }
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `{ stamped: number; total: number }`

### `scrubSource`
Return a CLONE of the document with every `x-suluk-source` removed — for externally published projections, where
a source pointer is internal-layout disclosure (council: scrub from external). Shallow-clones paths/requests so
the canonical (which keeps provenance for the maintainer view) is never mutated.
```ts
scrubSource(doc: OpenAPIv4Document): OpenAPIv4Document
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `OpenAPIv4Document`

### `sourceKey`
"<file>#<symbol>" — the canonical string key for a source pointer.
```ts
sourceKey(s: SulukSource): string
```
**Parameters:**
- `s: SulukSource`
**Returns:** `string`

## ratelimit

### `rateLimitOf`
Read the declared rate-limit facet off an operation.
```ts
rateLimitOf(req: { x-suluk-ratelimit?: SulukRateLimit }): SulukRateLimit | undefined
```
**Parameters:**
- `req: { x-suluk-ratelimit?: SulukRateLimit }`
**Returns:** `SulukRateLimit | undefined`

### `rateLimitIndex`
The DERIVED index: every operation that declares a rate-limit budget + its config. Computed by walking the
document; never read back from stored state. The "what is rate-limited, and how?" lookup (reference panels,
deploy-binding provisioning, audit).
```ts
rateLimitIndex(doc: OpenAPIv4Document): RateLimitGroup[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `RateLimitGroup[]`

### `rateLimitCoverage`
Coverage gauge: operations declaring a budget vs total — the rate-limit-coverage counterpart to `sourceCoverage`.
```ts
rateLimitCoverage(doc: OpenAPIv4Document): { limited: number; total: number }
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `{ limited: number; total: number }`

### `retryAfterSeconds`
Retry-After seconds for a budget — `ceil(windowMs / 1000)`, ported from saastarter route-handler.ts:75.
Poison-guarded: a non-finite window yields 0 (never propagates NaN into a header).
```ts
retryAfterSeconds(facet: Pick<SulukRateLimit, "windowMs">): number
```
**Parameters:**
- `facet: Pick<SulukRateLimit, "windowMs">`
**Returns:** `number`

## errors

### `isProblemDetails`
Structural guard — discriminates a Problem Details body (parallel to saastarter's `isApiError` and core's
`isReference`). Checks the two always-present RFC-9457 members `title` (string) + `status` (number).
```ts
isProblemDetails(body: unknown): body is ProblemDetails
```
**Parameters:**
- `body: unknown`
**Returns:** `body is ProblemDetails`

### `toProblemDetails`
Pure constructor: a tag (+ optional detail/instance/errors/type) → the canonical Problem Details body.
Fills `status` + `title` from the frozen tables and a stable legacy `error` code. No I/O, no throwing.
```ts
toProblemDetails(args: { tag: ErrorTag; detail?: string; instance?: string; errors?: Record<string, unknown>; type?: string }): ProblemDetails
```
**Parameters:**
- `args: { tag: ErrorTag; detail?: string; instance?: string; errors?: Record<string, unknown>; type?: string }`
**Returns:** `ProblemDetails`

## template

### `compileTemplate`
```ts
compileTemplate(tmpl: string): CompiledTemplate
```
**Parameters:**
- `tmpl: string`
**Returns:** `CompiledTemplate`

### `matchPath`
Reverse-parse: match a concrete URL path against the template. Returns captured path variables, or null
if no match. Split on '/' first, then percent-decode captures (RFC3986 §2.1). Deterministic / injective
within the profile (no operator can yield two interpretations).
```ts
matchPath(c: CompiledTemplate, urlPath: string): Record<string, string> | null
```
**Parameters:**
- `c: CompiledTemplate`
- `urlPath: string`
**Returns:** `Record<string, string> | null`

### `variableCount`
Number of variable segments (for concrete-over-variable precedence ranking).
```ts
variableCount(c: CompiledTemplate): number
```
**Parameters:**
- `c: CompiledTemplate`
**Returns:** `number`

## signature

### `computeSignature`
Compute a request's canonical signature tuple + deterministic key string (C019 §A.2).
```ts
computeSignature(uriTemplate: string, req: Request): { tuple: SignatureTuple; key: string }
```
**Parameters:**
- `uriTemplate: string`
- `req: Request`
**Returns:** `{ tuple: SignatureTuple; key: string }`

### `collide`
Pairwise three-valued collision predicate (C003 detect-and-tolerate; NOT a gate).
```ts
collide(a: SignatureTuple, b: SignatureTuple): CollisionVerdict
```
**Parameters:**
- `a: SignatureTuple`
- `b: SignatureTuple`
**Returns:** `CollisionVerdict`

## ada

### `buildAda`
Build the ADA from a parsed document: index every request, compute signatures, detect collisions.
```ts
buildAda(doc: OpenAPIv4Document): Ada
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `Ada`

### `matchRequest`
Match a concrete HTTP request (method + URL) to zero-or-one operation (CONFORMANCE §B.3).
Recognition direction: reverse-parse the path, filter by method; concrete-over-variable is a runtime
tiebreak (fewest path variables wins). Returns null if no operation matches.
```ts
matchRequest(ada: Ada, method: string, url: string): MatchResult | null
```
**Parameters:**
- `ada: Ada`
- `method: string`
- `url: string`
**Returns:** `MatchResult | null`

### `parseQuery`
Parse a raw query string into the form-style key→values map (C019 §A.3 default; repeated keys → array).
```ts
parseQuery(qs: string): Record<string, string[]>
```
**Parameters:**
- `qs: string`
**Returns:** `Record<string, string[]>`
