[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/openapi-compat](../README.md) / Diagnostic

# Interface: Diagnostic

Defined in: [downgrade.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/compat/src/downgrade.ts#L24)

`@suluk/openapi-compat` — convert between the OpenAPI v4 "Suluk" candidate and OpenAPI 3.1.

downgrade(v4) → 3.1 is the lever for Scalar & Swagger UI (they consume 3.x). upgrade(3.1) → v4 is the
reverse. The pair is lossless for documents that fit 3.1's expressivity; where v4 exceeds 3.1 (notably
multiple requests per method on one path, C003), downgrade() reports it in `diagnostics` rather than
losing it silently. Schema Objects are shared verbatim (both are JSON Schema 2020-12). CANDIDATE tooling.

## Properties

### kind

> **kind**: `"collision"` \| `"remap"` \| `"drop"`

Defined in: [downgrade.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/compat/src/downgrade.ts#L26)

"collision" (same-method v4 requests merged into one 3.1 operation — non-lossy) | "remap" (ref/feature rewritten) | "drop" (unrepresentable).

***

### message

> **message**: `string`

Defined in: [downgrade.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/compat/src/downgrade.ts#L28)

***

### path

> **path**: `string`

Defined in: [downgrade.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/compat/src/downgrade.ts#L27)
