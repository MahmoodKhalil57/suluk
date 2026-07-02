[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / PROBLEM\_DETAILS\_SCHEMA

# Variable: PROBLEM\_DETAILS\_SCHEMA

> `const` **PROBLEM\_DETAILS\_SCHEMA**: `Readonly`\<\{ `description`: `"RFC-9457 Problem Details (application/problem+json)."`; `properties`: \{ `detail`: \{ `type`: `string`; \}; `error`: \{ `deprecated`: `boolean`; `type`: `string`; \}; `errors`: \{ `additionalProperties`: `boolean`; `type`: `string`; \}; `instance`: \{ `format`: `string`; `type`: `string`; \}; `status`: \{ `type`: `string`; \}; `title`: \{ `type`: `string`; \}; `type`: \{ `default`: `string`; `format`: `string`; `type`: `string`; \}; \}; `required`: `string`[]; `title`: `"ProblemDetails"`; `type`: `"object"`; \}\>

Defined in: [errors.ts:87](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/core/src/errors.ts#L87)

The canonical JSON Schema (2020-12) form of [ProblemDetails](../interfaces/ProblemDetails.md) — the `$ref` target @suluk/hono's emit
injects into `components.schemas.ProblemDetails`, so the SDK's `isApiError` typing and testgen's
error-conformance validate against ONE shared schema. Frozen; mirrors the type above.
