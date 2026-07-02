[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/openapi-compat](../README.md) / DowngradeResult

# Interface: DowngradeResult

Defined in: [downgrade.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/compat/src/downgrade.ts#L31)

`@suluk/openapi-compat` — convert between the OpenAPI v4 "Suluk" candidate and OpenAPI 3.1.

downgrade(v4) → 3.1 is the lever for Scalar & Swagger UI (they consume 3.x). upgrade(3.1) → v4 is the
reverse. The pair is lossless for documents that fit 3.1's expressivity; where v4 exceeds 3.1 (notably
multiple requests per method on one path, C003), downgrade() reports it in `diagnostics` rather than
losing it silently. Schema Objects are shared verbatim (both are JSON Schema 2020-12). CANDIDATE tooling.

## Properties

### diagnostics

> **diagnostics**: [`Diagnostic`](Diagnostic.md)[]

Defined in: [downgrade.ts:35](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/compat/src/downgrade.ts#L35)

Everything that could not be represented losslessly — the honest audit trail.

***

### document

> **document**: `Record`\<`string`, `unknown`\>

Defined in: [downgrade.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/compat/src/downgrade.ts#L33)

A valid OpenAPI 3.1 document (validate with validate31).
