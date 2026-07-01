[**Suluk**](../../README.md)

***

[Suluk](../../packages.md) / @suluk/core

<p align="center">
  <a href="https://github.com/MahmoodKhalil57/suluk">
    <img src="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/wordmark.png" alt="Suluk" width="360" />
  </a>
</p>

# @suluk/core

**The foundation library for OpenAPI v4 "Suluk" documents — parse, validate, resolve `$ref`, compute operation identity, build the ADA, and match requests.**

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```sh
bun add @suluk/core
```

## What it does

`@suluk/core` is the layer that handles a **v4 document as data** — the shared model every other
`@suluk/*` package builds on. It does five things, all pure (no I/O, no throwing except on bad refs):

- **Parse** YAML/JSON source text into a typed `OpenAPIv4Document` (`parseDocument`).
- **Validate** a document's *structure* against the v4 meta-schema (`validateDocument`) — using a
  **precompiled** AJV-standalone validator (no `eval`/`new Function`), so it runs on Cloudflare Workers
  and starts instantly. (It does **not** validate the inner JSON Schema 2020-12 Schema Objects.)
- **Resolve references by name** — `#/components/<type>/<name>` lookups that throw on a missing key and
  never fall back to positional order (`resolveRef`, `deref`, `isReference`).
- **Compute operation identity + the ADA** — canonical request signatures, three-valued collision
  detection, and the Abstract Description API (`computeSignature`, `collide`, `buildAda`).
- **Match a concrete HTTP request** (method + URL) to zero-or-one operation, with captured path params and
  the query string (`matchRequest`, `compileTemplate`, `matchPath`).

It also exposes the **shared, cross-package primitives**: RFC-9457 Problem Details + the typed-error →
HTTP-status table (`toProblemDetails`, `PROBLEM_STATUS_TABLE`), and pure read-only views over the
`x-suluk-source` and `x-suluk-ratelimit` facets (`sourceIndex`, `rateLimitIndex`, …).

## When to reach for it

Reach for `@suluk/core` any time you **hold a v4 doc as data**: validating user or generated input,
resolving a `$ref`, computing operation identity, detecting path/method collisions, or routing a request
to its operation. It is also the canonical home of the error envelope and facet readers that `@suluk/hono`,
`@suluk/sdk`, `@suluk/reference`, and `@suluk/testgen` all share.

When **not** to reach for it:

- Converting **3.1 ⇄ v4** → use [`@suluk/openapi-compat`](../openapi-compat).
- **Rendering** a doc as docs UI → use [`@suluk/scalar`](../scalar/README.md) / [`@suluk/swagger`](../swagger/README.md) /
  [`@suluk/reference`](../reference/README.md).
- **Generating** an SDK, tests, panels, or a Hono app from a doc → those are the derivation packages
  (`@suluk/sdk`, `@suluk/testgen`, `@suluk/panel`, `@suluk/hono`). `@suluk/core` is what they read *through*.

## Usage

### Parse → validate → match a request

```ts
import { parseDocument, validateDocument, buildAda, matchRequest } from "@suluk/core";

const doc = parseDocument(yamlOrJsonSource); // YAML is a superset; JSON parses too

const { valid, errors } = validateDocument(doc);
if (!valid) {
  // errors: { path: string; message: string }[]
  throw new Error(errors.map((e) => `${e.path}: ${e.message}`).join("\n"));
}

const ada = buildAda(doc); // index every request, compute signatures, detect collisions

const match = matchRequest(ada, "GET", "/pet/123?status=available");
// → { operation, pathParams: { petId: "123" }, query: { status: ["available"] } } | null
if (match) {
  match.operation.name;        // "getPet" — the by-name DOM handle (C009)
  match.pathParams.petId;      // "123"
  match.query.status;          // ["available"]
}
```

`buildAda(doc)` returns `{ operations, bySignature, collisions }`. Collisions are **detect-and-tolerate**,
never a gate — `collisions` lists pairs that aren't `provably-disjoint`. Matching uses
concrete-over-variable precedence (fewest path variables wins), so `GET /pet` resolves to `listPets`, not
`getPet` (`/pet/{petId}`).

### Resolve references by name

```ts
import { resolveRef, deref, isReference } from "@suluk/core";

const pet = resolveRef(doc, "#/components/schemas/Pet"); // by-name; throws if the key is absent
const schema = deref(doc, maybeRef);                     // one hop: unwrap a Reference, else pass through
if (isReference(value)) value.$ref;                      // structural guard
```

Resolution is **own-property only** — a `$ref` to a JS builtin name (`constructor`, `__proto__`) throws
`reference not found` rather than walking the prototype chain. Cross-document imports are not yet supported;
a bare `#/...` is always same-document.

### Signatures + collision detection

```ts
import { computeSignature, collide } from "@suluk/core";

const a = computeSignature("pet/{petId}", request);  // { tuple, key }
const b = computeSignature("pet/{name}",  request);
a.key === b.key;                  // true — variable spelling is erased to {}; method is case-normalized

collide(a.tuple, b.tuple);
// "provably-disjoint" | "provable-collision" | "not-statically-determinable"
// inline request bodies collapse to the "#inline" sentinel — the matcher never reads JSON Schema (D1)
```

### Error envelopes (RFC-9457 Problem Details)

The shared error model used across packages — pure data, no throwing, no HTTP:

```ts
import { toProblemDetails, isProblemDetails, PROBLEM_CONTENT_TYPE, PROBLEM_STATUS_TABLE } from "@suluk/core";

const body = toProblemDetails({ tag: "ValidationError", detail: "bad body", errors: { name: "required" } });
// { type: "about:blank", title: "Validation failed", status: 400, error: "validation", detail, errors }

PROBLEM_STATUS_TABLE.NotFoundError; // 404 — the frozen typed-throw → HTTP-status table
isProblemDetails(body);             // structural guard (title + status)
PROBLEM_CONTENT_TYPE;               // "application/problem+json"
```

### Facet readers — `x-suluk-source` and `x-suluk-ratelimit`

Pure, derived, read-only views over the advisory `x-suluk-*` facets (the index is computed on demand,
never cached back onto the document):

```ts
import { sourceIndex, sourceCoverage, scrubSource, rateLimitIndex, rateLimitCoverage } from "@suluk/core";

sourceIndex(doc);      // [{ file, symbol, kind?, operations: [{ path, name, method }] }] — what each source drives
sourceCoverage(doc);   // { stamped, total } — provenance-coverage gauge
scrubSource(doc);      // a CLONE with every x-suluk-source removed (for externally published projections)

rateLimitIndex(doc);   // operations that declare a rate budget + their config
rateLimitCoverage(doc);// { limited, total }
```

A source pointer is the audit trail of *where* a contract element was projected from — it is **advisory
only**, never an authz, routing, or identity input. Externally published views should `scrubSource(doc)`.

## API

| Export | What it does |
| --- | --- |
| `parseDocument(src)` | YAML/JSON text → `OpenAPIv4Document` |
| `validateDocument(doc)` | structural meta-schema validation → `{ valid, errors[] }` |
| `isValidDocument(doc)` | type guard: validates → narrows to `OpenAPIv4Document` |
| `resolveRef` / `deref` / `isReference` | same-document by-name `$ref` resolution + guards |
| `buildAda(doc)` | the Abstract Description API: `{ operations, bySignature, collisions }` |
| `matchRequest(ada, method, url)` | route a request → `{ operation, pathParams, query }` or `null` |
| `parseQuery(qs)` | raw query string → `Record<string, string[]>` |
| `computeSignature` / `collide` | canonical request signature + three-valued collision verdict |
| `compileTemplate` / `matchPath` / `variableCount` | RFC-6570 template compile + reverse-parse |
| `toProblemDetails` / `isProblemDetails` | RFC-9457 Problem Details constructor + guard |
| `PROBLEM_STATUS_TABLE` / `TITLE_BY_TAG` / `PROBLEM_CONTENT_TYPE` / `PROBLEM_DETAILS_SCHEMA` | the frozen error model |
| `sourceIndex` / `sourceCoverage` / `scrubSource` / `sourceKey` | `x-suluk-source` facet views |
| `rateLimitIndex` / `rateLimitCoverage` / `rateLimitOf` / `retryAfterSeconds` / `RATELIMIT_EXT` | `x-suluk-ratelimit` facet views |

Plus the document model types (`OpenAPIv4Document`, `PathItem`, `Request`, `Response`, `Schema`,
`Reference`, `SulukSource`, `SulukAgent`, `SulukJob`, `SulukPolicy`, …) — import them as the parsed-document
type surface.

## Boundary

`@suluk/core` is **data, not runtime** — pure functions over the document, with no I/O and no HTTP. It
*reads and reasons about* a contract; it never hosts one. Enforcement and rendering live downstream:
`@suluk/hono` *enforces* a declared rate budget (core only *reads* it), `@suluk/scalar` *renders* the doc,
the derivation packages *generate* code you own. The facet readers are deliberately advisory — a source
pointer or a cost/access annotation is an audit signal, never an authz or routing input.

The structural validator is a precompiled AJV standalone for Workers-safety — **never add dynamic codegen**
to it. New *structural* rules of the spec belong here, behind the meta-schema; behavioral and rendering
concerns belong in the packages that read through this one.

## License

Apache-2.0

## Interfaces

- [Ada](interfaces/Ada.md)
- [Collision](interfaces/Collision.md)
- [CompiledTemplate](interfaces/CompiledTemplate.md)
- [Components](interfaces/Components.md)
- [Info](interfaces/Info.md)
- [MatchResult](interfaces/MatchResult.md)
- [OpenAPIv4Document](interfaces/OpenAPIv4Document.md)
- [Operation](interfaces/Operation.md)
- [ParameterSchema](interfaces/ParameterSchema.md)
- [PathItem](interfaces/PathItem.md)
- [ProblemDetails](interfaces/ProblemDetails.md)
- [RateLimitGroup](interfaces/RateLimitGroup.md)
- [Reference](interfaces/Reference.md)
- [Request](interfaces/Request.md)
- [Response](interfaces/Response.md)
- [SchemaProperty](interfaces/SchemaProperty.md)
- [SecurityScheme](interfaces/SecurityScheme.md)
- [Server](interfaces/Server.md)
- [Shared](interfaces/Shared.md)
- [SignatureTuple](interfaces/SignatureTuple.md)
- [SourceGroup](interfaces/SourceGroup.md)
- [SourceRef](interfaces/SourceRef.md)
- [SulukAgent](interfaces/SulukAgent.md)
- [SulukAgentRef](interfaces/SulukAgentRef.md)
- [SulukApproval](interfaces/SulukApproval.md)
- [SulukJob](interfaces/SulukJob.md)
- [SulukPolicy](interfaces/SulukPolicy.md)
- [SulukRateLimit](interfaces/SulukRateLimit.md)
- [SulukResource](interfaces/SulukResource.md)
- [SulukResourceRef](interfaces/SulukResourceRef.md)
- [SulukRouteRef](interfaces/SulukRouteRef.md)
- [SulukSkillRef](interfaces/SulukSkillRef.md)
- [SulukSource](interfaces/SulukSource.md)
- [SulukStore](interfaces/SulukStore.md)
- [Tag](interfaces/Tag.md)
- [ValidationIssue](interfaces/ValidationIssue.md)
- [ValidationResult](interfaces/ValidationResult.md)

## Type Aliases

- [Callback](type-aliases/Callback.md)
- [CollisionVerdict](type-aliases/CollisionVerdict.md)
- [ErrorTag](type-aliases/ErrorTag.md)
- [HttpMethod](type-aliases/HttpMethod.md)
- [PathSegment](type-aliases/PathSegment.md)
- [ProblemStatus](type-aliases/ProblemStatus.md)
- [PropertyFacets](type-aliases/PropertyFacets.md)
- [Schema](type-aliases/Schema.md)
- [SchemaOrRef](type-aliases/SchemaOrRef.md)
- [SecurityRequirement](type-aliases/SecurityRequirement.md)
- [SulukNotifyPolicy](type-aliases/SulukNotifyPolicy.md)
- [SulukNotifySeverity](type-aliases/SulukNotifySeverity.md)

## Variables

- [PROBLEM\_CONTENT\_TYPE](variables/PROBLEM_CONTENT_TYPE.md)
- [PROBLEM\_DETAILS\_SCHEMA](variables/PROBLEM_DETAILS_SCHEMA.md)
- [PROBLEM\_STATUS\_TABLE](variables/PROBLEM_STATUS_TABLE.md)
- [RATELIMIT\_EXT](variables/RATELIMIT_EXT.md)
- [TITLE\_BY\_TAG](variables/TITLE_BY_TAG.md)

## Functions

- [buildAda](functions/buildAda.md)
- [collide](functions/collide.md)
- [compileTemplate](functions/compileTemplate.md)
- [computeSignature](functions/computeSignature.md)
- [deref](functions/deref.md)
- [isProblemDetails](functions/isProblemDetails.md)
- [isReference](functions/isReference.md)
- [isValidDocument](functions/isValidDocument.md)
- [matchPath](functions/matchPath.md)
- [matchRequest](functions/matchRequest.md)
- [parseDocument](functions/parseDocument.md)
- [parseQuery](functions/parseQuery.md)
- [rateLimitCoverage](functions/rateLimitCoverage.md)
- [rateLimitIndex](functions/rateLimitIndex.md)
- [rateLimitOf](functions/rateLimitOf.md)
- [resolveRef](functions/resolveRef.md)
- [retryAfterSeconds](functions/retryAfterSeconds.md)
- [scrubSource](functions/scrubSource.md)
- [sourceCoverage](functions/sourceCoverage.md)
- [sourceIndex](functions/sourceIndex.md)
- [sourceKey](functions/sourceKey.md)
- [toProblemDetails](functions/toProblemDetails.md)
- [validateDocument](functions/validateDocument.md)
- [variableCount](functions/variableCount.md)
