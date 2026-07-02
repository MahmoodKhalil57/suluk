[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / validateDocument

# Function: validateDocument()

> **validateDocument**(`doc`): [`ValidationResult`](../interfaces/ValidationResult.md)

Defined in: [validate.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/core/src/validate.ts#L15)

Validate a document's STRUCTURE against the v4 meta-schema (SPEC §1, ADRs C003/C004/C009/C013).

Uses a PRECOMPILED (ajv-standalone) validator (src/validate.standalone.js) — a plain function, no
`new Function`/eval — so @suluk/core validates on Cloudflare Workers (the deploy target forbids dynamic
code generation) and starts instantly. Regenerate with `bun run scripts/gen-validator.ts`. It does NOT
validate the inner JSON Schema 2020-12 Schema Objects (those are the 2020-12 dialect's concern).

## Parameters

### doc

`unknown`

## Returns

[`ValidationResult`](../interfaces/ValidationResult.md)
