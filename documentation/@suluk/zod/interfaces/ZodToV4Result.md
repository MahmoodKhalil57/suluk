[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/zod](../README.md) / ZodToV4Result

# Interface: ZodToV4Result

Defined in: [to-v4.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/zod/src/to-v4.ts#L17)

`@suluk/zod` — Zod ⇄ v4 "Suluk" Schema Object conversion.

The user-facing chain is: Zod → v4 → (Scalar/Swagger render) → v4 → Zod. Zod is the source of truth and
v4 (= JSON Schema 2020-12) is the interchange. zodToV4 emits a v4 Schema Object; v4ToZod rebuilds a Zod
schema. The pair is LOSSLESS over the JSON-Schema-representable subset — proven by a fixpoint test
(zodToV4∘v4ToZod∘zodToV4 == zodToV4). Zod runtime effects that JSON Schema cannot express (.transform,
.refine) are reported by zodToV4().warnings rather than dropped silently. CANDIDATE tooling.

## Properties

### schema

> **schema**: `Record`\<`string`, `unknown`\>

Defined in: [to-v4.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/zod/src/to-v4.ts#L19)

A v4 Schema Object (JSON Schema 2020-12), with the embedded `$schema` marker removed.

***

### warnings

> **warnings**: `string`[]

Defined in: [to-v4.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/zod/src/to-v4.ts#L21)

Zod runtime effects that could not be represented (dropped). Empty ⇒ fully lossless.
