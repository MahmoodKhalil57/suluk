# Types & Enums

## types

### `OpenAPIv4Document`
Top-level OpenAPI v4 document.
**Properties:**
- `openapi: string` — e.g. "4.0.0-candidate".
- `info: Info`
- `servers: Server[]` (optional)
- `tags: Record<string, Tag>` (optional) — Map keyed by tag name (C009).
- `paths: Record<string, PathItem>` — Map keyed by RFC6570 parseable-profile uriTemplate (C005).
- `apiResponses: Record<string, Response>` (optional) — Document-level responses reusable across all operations (§5).
- `webhooks: Record<string, Request>` (optional) — Incoming operations not hosted at the API's own paths (§14, C018).
- `x-suluk-jobs: Record<string, SulukJob>` (optional) — JOBS vendor map (C025) — non-HTTP background work (cron / queue consumers) that has NO inbound Request, so it
can't live in `paths` or `webhooks`. The first-class home C024 pre-blessed for its `scheduled`/`queue-consumed`
cost triggers. A VENDOR EXTENSION (the `x-suluk-*` namespace) — NOT a normative async construct (C018 scope held).
- `x-suluk-agents: Record<string, SulukAgent>` (optional) — AGENTS vendor map (C027) — `x-suluk-agents`. A composition manifest layered ON TOP of the API: each SulukAgent
is an LLM-orchestrated unit of SKILLS (model-bearing instruction bundles) + deterministic ROUTES (by-name
$refs into EXISTING operations, no `model`) + optional sub-AGENTS (by-name refs; recursion bounded by a
REQUIRED `maxDepth` + a cycle-linter, never the schema). A VENDOR EXTENSION riding the C025 `x-suluk-jobs`
precedent EXACTLY — NOT a normative kind, NEVER read by the DOM→ADA matcher (D1 held; see
plan/facts/0agents-d1.bn + test/agents-d1-invariance.test.ts). Selection/tiering is RUNTIME-ADVISORY;
determinism is DECLARED, never enforced. Severable: a 3.1 downgrade DROPS this map whole and the routes
survive as the ordinary operations they always referenced. Originated, low ceiling (~0.52); pairs with ADR C027.
- `x-suluk-policy: Record<string, SulukPolicy>` (optional) — POLICY vendor map (C028) — `x-suluk-policy`, keyed by OPERATOR/fleet name (not agent name: the operator owns
it, one policy spans many third-party agents). An operator-owned governance overlay that NARROWS what an agent
self-declares (effective = INTERSECT(operatorPolicy, agentSelfDeclaration); monotone — never grants). Rides the
x-suluk-jobs/x-suluk-agents move EXACTLY: optional, additive, NO new normative kind, NEVER read by the matcher
(D1; see plan/facts/0policy-d1.bn + test/policy-d1-invariance.test.ts). Only the STATIC subset is decidable here;
the `costCeiling` is DECLARED, enforced by a runtime adapter (`enforcedBy`), never by the schema. Originated, low
ceiling (~0.52); pairs with ADR C028.
- `x-suluk-resources: Record<string, SulukResource>` (optional) — RESOURCES vendor map (C036) — `x-suluk-resources`. The loadable, on-demand CATALOG of instructions / references /
scripts an agent can ACTIVATE when a task matches (Cloudflare "Agent Skills" / loadable context-memory alignment;
this is the `x-suluk-resources` name C035 RESERVED, now defined by operator direction). Distinct from a `skill`
(model-bearing, always-on system text): a resource is content-only, lazy, and carries no model. Rides the
x-suluk-jobs/agents/policy move EXACTLY — optional, additive, NO new normative kind, NEVER read by the matcher
(D1; a new x-* sibling is invisible to buildAda — see test/resources-d1-invariance.test.ts). Content is a
PROVENANCE POINTER (the catalog/SKILL.md is GENERATED, hashed for drift), never inlined. Experimental-anchored
(CF Agent Skills + script execution are experimental) ⇒ honestly LOW ceiling (~0.5); pairs with ADR C036.
- `x-suluk-notify: SulukNotifyPolicy` (optional) — REACTIVE notify policy (C037) — `x-suluk-notify`. A document-level status→severity map that drives the CALLBACK
layer of the `@suluk/sdk` reactive client: which responses surface to the user, and how. CLIENT-CODEGEN ONLY —
read by NO server path, NO runtime, NO matcher; strictly weaker than every other x-suluk-* facet (those at least
feed runtime-advisory selection). Optional, additive, NO new normative kind, NO meta-schema change. Pairs with the
per-op `x-suluk-store` facet + ADR C037. Originated, low ceiling (~0.5).
- `components: Components` (optional)

### `Info`
`@suluk/core` — the foundation library for the OpenAPI v4.0 "Suluk" candidate.

parse → validate (meta-schema) → resolve references (by-name) → compute signatures → build the ADA →
match requests. Implements the structural + behavioral contract in
specification/candidate-v4/conformance/CONFORMANCE.md and the buildable grammars in SPEC Appendix A (C019).
CANDIDATE tooling — provisional; the soft points (CONFIDENCE.md) are isolated here.
**Properties:**
- `title: string`
- `version: string`
- `description: string` (optional)
- `termsOfService: string` (optional)
- `contact: Record<string, unknown>` (optional)
- `license: { name?: string; url?: string }` (optional)

### `Server`
Server IDENTITY — a by-name shape primitive (C015 #55); environment URL config is a deployment concern.
**Properties:**
- `url: string`
- `description: string` (optional)

### `Tag`
`@suluk/core` — the foundation library for the OpenAPI v4.0 "Suluk" candidate.

parse → validate (meta-schema) → resolve references (by-name) → compute signatures → build the ADA →
match requests. Implements the structural + behavioral contract in
specification/candidate-v4/conformance/CONFORMANCE.md and the buildable grammars in SPEC Appendix A (C019).
CANDIDATE tooling — provisional; the soft points (CONFIDENCE.md) are isolated here.
**Properties:**
- `summary: string` (optional)
- `description: string` (optional)
- `type: string` (optional)

### `PathItem`
A pathItem, keyed in `paths` by its uriTemplate. Each request *is* an operation (SPEC §1.3/1.4).
**Properties:**
- `summary: string` (optional)
- `description: string` (optional)
- `servers: Server[]` (optional)
- `shared: Shared` (optional) — Optional per-level inheritance wrapper (C012 #116).
- `requests: Record<string, Request>` — The operations at this path, keyed by stable name (C009). At least one required.
- `pathResponses: Record<string, Response>` (optional) — Responses reusable across this pathItem's requests (§5).

### `Shared`
Optional inheritance wrapper; its `parameterSchema` is allOf-composed into each request (C012 #116, @0.55).
**Properties:**
- `parameterSchema: ParameterSchema` (optional)

### `Request`
A Request *is* an operation (SPEC §1.4). DOM handle = its name (the key in `PathItem.requests`);
ADA identity = its signature (C003/C019 Appendix A — computed, not authored).
**Properties:**
- `method: HttpMethod`
- `summary: string` (optional)
- `description: string` (optional)
- `operationId: string` (optional) — Optional legacy handle; not the v4 primary identity (C009).
- `tags: string[]` (optional)
- `deprecated: boolean` (optional)
- `contentType: string | string[]` (optional) — Request body media type(s) — plain IANA media type; params via the content model (§6/§7).
- `contentSchema: SchemaOrRef` (optional)
- `parameterSchema: ParameterSchema` (optional)
- `responses: Record<string, Response>` — Named responses (§5); each carries its own status. At least one required.
- `callbacks: Record<string, Callback>` (optional)
- `security: SecurityRequirement[]` (optional) — Applied security, referenced BY NAME (C014 #69).
- `servers: Server[]` (optional)
- `x-suluk-source: SulukSource` (optional) — PROVENANCE facet (council whuovh6gs, L2): where in the AUTHORED source this operation was projected FROM.
A stable SYMBOLIC pointer (file + exported symbol) — never a line number, never an authz/routing input
(advisory only; C022 inv.5). STAMPED by the projection pass, never hand-authored. Scrub from externally
published projections (it discloses internal layout) — see core's `scrubSource` / `sourceIndex`.
- `x-suluk-ratelimit: SulukRateLimit` (optional) — RATE-LIMIT facet (saastarter-parity Phase 0): the declared per-operation rate budget. ADVISORY VENDOR
EXTENSION (see SulukRateLimit) — @suluk/hono's middleware ENFORCES it on the wire; core only
carries the shape + derived reads (`rateLimitIndex`/`rateLimitCoverage`/`retryAfterSeconds`).
- `x-suluk-approval: SulukApproval` (optional) — HUMAN-IN-THE-LOOP APPROVAL facet (Stage 1.4): declares that invoking this operation as an AGENT TOOL requires
human approval before it runs — a consequential/irreversible action an autonomous loop must pause on. Advisory,
like SulukApproval describes.
- `x-suluk-store: SulukStore` (optional) — REACTIVE-STORE facet (C037) — `x-suluk-store`. Declares this operation's role in the `@suluk/sdk` reactive client:
a QUERY (`key` present) projects to a `$<key>` store; a MUTATION (`invalidates` present) invalidates those stores
on success. CLIENT-CODEGEN ONLY — a pure hint for the generated frontend layer; NEVER read by the matcher/runtime
(D1; see SulukStore, plan/facts/0reactive.bn + test/store-d1-invariance.test.ts). Target-agnostic: the
default adapter projects to nanostores + @nanostores/query, but the declaration is a dependency graph any reactive
runtime (TanStack Query / SWR / Pinia Colada) can consume — the C034 runtime-adapter-seam move, one layer up.

### `HttpMethod`
`@suluk/core` — the foundation library for the OpenAPI v4.0 "Suluk" candidate.

parse → validate (meta-schema) → resolve references (by-name) → compute signatures → build the ADA →
match requests. Implements the structural + behavioral contract in
specification/candidate-v4/conformance/CONFORMANCE.md and the buildable grammars in SPEC Appendix A (C019).
CANDIDATE tooling — provisional; the soft points (CONFIDENCE.md) are isolated here.
```ts
"get" | "GET" | "put" | "PUT" | "post" | "POST" | "patch" | "PATCH" | "delete" | "DELETE" | "head" | "HEAD" | "options" | "OPTIONS" | "trace" | "TRACE"
```

### `ParameterSchema`
Per-location typed parameter slots (C004 #20). Each slot is a JSON Schema 2020-12 over its instance.
**Properties:**
- `query: SchemaOrRef` (optional)
- `path: SchemaOrRef` (optional)
- `header: SchemaOrRef` (optional)
- `cookie: SchemaOrRef` (optional)
- `body: SchemaOrRef` (optional)

### `Response`
Named in its containing map. Precedence: request > pathResponses > apiResponses (C012 #17b).
**Properties:**
- `status: string | number` — HTTP status ("200"/200), a wildcard ("5XX"), or "default".
- `contentType: string | string[]` (optional)
- `contentSchema: SchemaOrRef` (optional)
- `description: string` (optional)

### `Callback`
A runtime-expression-keyed map of pathItem-shaped definitions (§14, C018).
The enclosing `Request.callbacks` is name-keyed, so `callbacks[name][expression]` is a PathItem.
```ts
Record<string, PathItem>
```

### `Components`
Reusable definitions; the referencing anchor (C013). Keyed by name (C009).
**Properties:**
- `schemas: Record<string, Schema>` (optional)
- `requests: Record<string, Request>` (optional)
- `responses: Record<string, Response>` (optional)
- `securitySchemes: Record<string, SecurityScheme>` (optional)
- `links: Record<string, unknown>` (optional)
- `examples: Record<string, unknown>` (optional)

### `SecurityRequirement`
Map of securityScheme name → array of scope strings (referenced BY NAME, C014 #69).
```ts
Record<string, string[]>
```

### `SecurityScheme`
`@suluk/core` — the foundation library for the OpenAPI v4.0 "Suluk" candidate.

parse → validate (meta-schema) → resolve references (by-name) → compute signatures → build the ADA →
match requests. Implements the structural + behavioral contract in
specification/candidate-v4/conformance/CONFORMANCE.md and the buildable grammars in SPEC Appendix A (C019).
CANDIDATE tooling — provisional; the soft points (CONFIDENCE.md) are isolated here.
**Properties:**
- `type: "apiKey" | "http" | "oauth2" | "openIdConnect" | "mutualTLS"`
- `name: string` (optional)
- `in: "query" | "header" | "cookie"` (optional)
- `scheme: string` (optional)
- `flows: Record<string, unknown>` (optional)
- `openIdConnectUrl: string` (optional)

### `Reference`
An OpenAPI Reference Object (C013 #49). `$ref` is a JSON-Pointer "#/components/<type>/<name>"
resolved BY NAME (C009; the resolve algorithm is C019 Appendix A).
**Properties:**
- `$ref: string`
- `summary: string` (optional)
- `description: string` (optional)

### `Schema`
A JSON Schema 2020-12 object (or boolean). Opaque here — validated by the 2020-12 dialect (C013).
May itself contain a JSON-Schema `$ref` keyword (distinct from an OpenAPI Reference Object).
Its `properties[name]` subschemas are the PROPERTY-LEVEL facet locus (SchemaProperty).
```ts
Record<string, unknown> | boolean
```

### `SchemaOrRef`
Either an inline Schema Object or an OpenAPI Reference Object.
```ts
Schema | Reference
```

### `SulukSource`
A stable, symbolic pointer back to the authored source an element was projected from (advisory provenance).
**Properties:**
- `file: string` — repo-relative path to the authoring file (e.g. "src/server/schema.ts"). NOT a line number.
- `symbol: string` — the exported symbol within that file (e.g. a Drizzle table export, or the operation's name).
- `kind: string` (optional) — what kind of authored thing it is — "drizzle-table" | "operation" | "better-auth" | … (advisory label).

### `SulukRateLimit`
RATE-LIMIT facet shape (saastarter-parity Phase 0): the per-operation rate budget an operation DECLARES.
Orthogonal to the NORMATIVE spec, which holds rate-limiting out-of-scope (C012 / frontier #43, ceiling 0.74):
like `x-suluk-cost`/`access`/`source` this is a vendor extension in the `x-suluk-*` namespace, never a
normative OAS construct. Advisory only — the facet declares the budget; the middleware enforces it.

`windowMs` + `maxRequests` are the fixed-window budget, ported from saastarter's `checkRateLimit` opts
(src/lib/effect/rate-limit.ts:16-19). `key` is the declared key STRATEGY the runtime resolves a concrete
key from: only `"ip"` is saastarter-faithful (it keys by a resolved IP); `"principal"`/`"api-key"`/`"global"`
are ORIGINATED extensions (honestly-low ceiling — `"principal"` keying is gated on the Principal-model
decision, roadmap Open-Decision #5, so the Phase-0 middleware implements only `"ip"` + a caller-supplied override).
**Properties:**
- `windowMs: number` — fixed window length, milliseconds.
- `maxRequests: number` — max requests permitted per resolved key within the window.
- `key: "ip" | "principal" | "api-key" | "global"` — the key STRATEGY (the runtime derives the concrete key). `"ip"` is the faithful default.
- `scope: string` (optional) — optional sub-bucket name — lets two operations share or separate a budget (advisory).
- `description: string` (optional)

### `SulukApproval`
HUMAN-IN-THE-LOOP APPROVAL facet (Stage 1.4). Like x-suluk-cost/access/ratelimit it is an ADVISORY vendor extension
in the `x-suluk-*` namespace — the facet DECLARES the gate; a runtime adapter ENFORCES it (e.g. @suluk/agents'
`projectCloudflareAgent` emits the Cloudflare Agents SDK `needsApproval` predicate from it). STATIC by construction:
`required` is a fixed boolean — the facet NEVER carries a request-value selector (the D1 red-line), so a server can
never be pressured into a dynamic dispatch decision; the gate is "this action, always", decided at author time.
**Properties:**
- `required: boolean` — require human approval before this operation runs as an agent tool.
- `reason: string` (optional) — why approval is needed — shown to the human approver and in docs.

### `SchemaProperty`
The PROPERTY-LEVEL facet locus (saastarter-parity Phase 0). core's `x-suluk-*` facets are operation-level
today (on Request); a Schema Object's `properties[name]` is the locus for a FUTURE property-level
facet — e.g. `@suluk/drizzle` attaching `x-suluk-i18n` to a localized column. This is an ADVISORY typed VIEW
over the opaque Schema: it never narrows the runtime Schema type (which stays 2020-12-opaque), so a
property carrying an `x-suluk-*` member is still a valid 2020-12 subschema (the dialect ignores `x-*` keywords).

### `PropertyFacets`

<!-- truncated -->
