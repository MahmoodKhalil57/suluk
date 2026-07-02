# Variables & Constants

## ratelimit

### `RATELIMIT_EXT`
The vendor-extension key under which an operation declares its rate budget.
```ts
const RATELIMIT_EXT: "x-suluk-ratelimit"
```

## errors

### `PROBLEM_CONTENT_TYPE`
RFC-9457 media type for a Problem Details body.
```ts
const PROBLEM_CONTENT_TYPE: "application/problem+json"
```

### `PROBLEM_STATUS_TABLE`
typed-throw → HTTP status, ported verbatim from saastarter route-handler.ts:24-86. Frozen — the single
source of the mapping every package shares. Note `ExternalServiceError` → 502 (route-handler.ts:62-67):
the roadmap's Phase-0 list abbreviated the codes and omitted it; the faithful port keeps it.
```ts
const PROBLEM_STATUS_TABLE: Readonly<Record<ErrorTag, ProblemStatus>>
```

### `TITLE_BY_TAG`
Human-readable `title` per tag (RFC-9457 §3.1.1: `title` is human, `type` is the machine id). The STATIC
saastarter strings are ported verbatim where one exists; the rest derive a sensible title (saastarter built
those messages from dynamic data — e.g. `${resource} not found` — so there is no static string to port).
```ts
const TITLE_BY_TAG: Readonly<Record<ErrorTag, string>>
```

### `PROBLEM_DETAILS_SCHEMA`
The canonical JSON Schema (2020-12) form of ProblemDetails — the `$ref` target @suluk/hono's emit
injects into `components.schemas.ProblemDetails`, so the SDK's `isApiError` typing and testgen's
error-conformance validate against ONE shared schema. Frozen; mirrors the type above.
```ts
const PROBLEM_DETAILS_SCHEMA: Readonly<{ type: "object"; title: "ProblemDetails"; description: "RFC-9457 Problem Details (application/problem+json)."; properties: { type: { type: string; format: string; default: string }; title: { type: string }; status: { type: string }; detail: { type: string }; instance: { type: string; format: string }; errors: { type: string; additionalProperties: boolean }; error: { type: string; deprecated: boolean } }; required: string[] }>
```
