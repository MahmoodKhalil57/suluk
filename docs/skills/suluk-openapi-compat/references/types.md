# Types & Enums

## downgrade

### `DowngradeResult`
`@suluk/openapi-compat` — convert between the OpenAPI v4 "Suluk" candidate and OpenAPI 3.1.

downgrade(v4) → 3.1 is the lever for Scalar & Swagger UI (they consume 3.x). upgrade(3.1) → v4 is the
reverse. The pair is lossless for documents that fit 3.1's expressivity; where v4 exceeds 3.1 (notably
multiple requests per method on one path, C003), downgrade() reports it in `diagnostics` rather than
losing it silently. Schema Objects are shared verbatim (both are JSON Schema 2020-12). CANDIDATE tooling.
**Properties:**
- `document: Record<string, unknown>` — A valid OpenAPI 3.1 document (validate with validate31).
- `diagnostics: Diagnostic[]` — Everything that could not be represented losslessly — the honest audit trail.

### `Diagnostic`
`@suluk/openapi-compat` — convert between the OpenAPI v4 "Suluk" candidate and OpenAPI 3.1.

downgrade(v4) → 3.1 is the lever for Scalar & Swagger UI (they consume 3.x). upgrade(3.1) → v4 is the
reverse. The pair is lossless for documents that fit 3.1's expressivity; where v4 exceeds 3.1 (notably
multiple requests per method on one path, C003), downgrade() reports it in `diagnostics` rather than
losing it silently. Schema Objects are shared verbatim (both are JSON Schema 2020-12). CANDIDATE tooling.
**Properties:**
- `kind: "collision" | "remap" | "drop"` — "collision" (same-method v4 requests merged into one 3.1 operation — non-lossy) | "remap" (ref/feature rewritten) | "drop" (unrepresentable).
- `path: string`
- `message: string`

## validate31

### `Validation31`
**Properties:**
- `valid: boolean`
- `errors: { path: string; message: string }[]`
