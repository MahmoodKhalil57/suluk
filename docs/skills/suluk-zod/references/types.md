# Types & Enums

## to-v4

### `ZodToV4Result`
`@suluk/zod` — Zod ⇄ v4 "Suluk" Schema Object conversion.

The user-facing chain is: Zod → v4 → (Scalar/Swagger render) → v4 → Zod. Zod is the source of truth and
v4 (= JSON Schema 2020-12) is the interchange. zodToV4 emits a v4 Schema Object; v4ToZod rebuilds a Zod
schema. The pair is LOSSLESS over the JSON-Schema-representable subset — proven by a fixpoint test
(zodToV4∘v4ToZod∘zodToV4 == zodToV4). Zod runtime effects that JSON Schema cannot express (.transform,
.refine) are reported by zodToV4().warnings rather than dropped silently. CANDIDATE tooling.
**Properties:**
- `schema: Record<string, unknown>` — A v4 Schema Object (JSON Schema 2020-12), with the embedded `$schema` marker removed.
- `warnings: string[]` — Zod runtime effects that could not be represented (dropped). Empty ⇒ fully lossless.

## lexical

### `LexicalState`
```ts
z.infer<typeof lexicalSchema>
```
