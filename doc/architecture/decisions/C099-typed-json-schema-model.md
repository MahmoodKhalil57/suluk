# C099 — A typed JSON Schema 2020-12 model in `@suluk/core` (the inputs/outputs source-of-truth)

> **Provenance.** A Suluk *candidate* decision (codename `asl-ojs`), authored by the single contributor, grounded in
> burhan/daftar/mizan — **not** a Moonwalk SIG decision. Operator-driven (2026-07-04). Revises the C013 opacity stance
> for the TYPE layer only. Reference model: TypeBox (`@sinclair/typebox`, JSON-Schema-native TS type builder).

**Status:** BUILT + VERIFIED across the whole ecosystem (every `@suluk/core` dependent typechecks clean; the `@suluk/hono`
emit path is runtime-green; type-level tests lock the guarantees). NOT yet published; NOT yet adopted by a downstream
generator to emit narrower types. Confidence ceiling **0.62** overall — the *backward-compatibility + correctness* sub-claims
are witnessed @≥0.85 (executable), but "this is the right durable source-of-truth design" awaits publish + downstream adoption.

## Context

The inner Schema Object — the type of every input (`contentSchema`, `ParameterSchema.{query,path,header,cookie,body}`) and
output (`Response.contentSchema`) — was **opaque** through C013–C098: `Schema = Record<string, unknown> | boolean`. Validation
is delegated to the JSON Schema 2020-12 dialect, so the meta-schema treats the Schema Object as a black box. That is correct
for *validation* but leaves the TYPE layer blind: a consumer reading Suluk's model gets `unknown` for what an input/output can
be, where a peer like `@scalar/types` ships a fully-typed, discriminated `SchemaObject`.

Operator ask: *"add much more types to our core such that it is the source of truth to what is possible; better define
everything that concerns the inputs and outputs etc that get generated, from Standard JSON Schema (TypeBox)."* Three forks
were put to the operator and decided:

1. **Vehicle** → *pure typed model, no runtime dependency* (not a TypeBox dep). `@suluk/core` is the dep-light published
   foundation (~30 in-repo dependents); TypeBox 1.x needs the TS7 native compiler (repo is on TS 6.0.3) and is ESM-only.
2. **Scope** → *the whole document model* to Scalar-level detail (not just the Schema Object).
3. **Authoring** → *type only; Zod stays the author.* `@suluk/zod`'s `zodToV4` still emits the schema; C099 only names the
   target type precisely. No new authoring primitive (the Zod-vs-TypeBox authoring question is explicitly deferred).

## Decision

Render the 2020-12 dialect as a **precise, TypeBox/JSON-Schema-aligned TypeScript model** in `@suluk/core` (`src/types.ts`),
mirrored vendor-free in `specification/candidate-v4/v4-types.ts`. **Nothing about validation changes** — the dialect stays the
runtime authority and the meta-schema stays deliberately opaque (re-inlining 2020-12 structurally would be redundant and
error-prone; the meta-schema's `$comment` now points to the TS model as the consistent descriptive rendering).

**The model.** `SchemaBase` (core `$id`/`$ref`/`$defs`/… + annotations + `enum`/`const` + composition
`allOf`/`anyOf`/`oneOf`/`not`/`if`/`then`/`else` + the OpenAPI schema flavor `discriminator`/`xml`/`externalDocs`) intersected
with per-type keyword groups into a discriminated union over `type`: `StringSchema | NumberSchema | ObjectSchema |
ArraySchema | BooleanSchema | NullSchema | MultiTypeSchema | UntypedSchema | OpaqueSchema`. Plus a dependency-free `Static<S>`
that mirrors TypeBox's `Static<>` for the common constructs (booleans, `const`, `enum`, the six primitives, arrays, objects
with `properties`+`required`, `allOf`/`anyOf`/`oneOf`). Document objects elaborated to parity: `Contact`/`License`,
`Server.variables`+`ServerVariable`, `ExternalDocumentation`, `Response.headers`/`links`+`Header`/`Link`/`Example`, typed
`Components` reuse maps, and a precise discriminated `SecuritySchemeObject` (+ `OAuthFlows`/`OAuthFlow`) added **additively**
alongside the loose `SecurityScheme` the document interfaces still carry.

**Two load-bearing invariants, both verified:**

- **Backward-compatibility is non-negotiable.** `@suluk/zod`'s `zodToV4().schema` is typed `Record<string, unknown>` and is
  assigned straight into `contentSchema?: SchemaOrRef` by `@suluk/hono`'s `emit.ts`; hand-built path-parameter literals with
  `properties: Record<string, unknown>` flow the same way. The **`OpaqueSchema` escape member** (`Record<string, unknown>`)
  keeps `Schema` a strict *superset* of the old opaque type, so every precise variant is purely additive and excess-property
  false-positives are suppressed. Proven: every one of the ~30 in-repo `@suluk/core` dependents typechecks clean, and the
  `@suluk/hono` suite (78 tests) stays green.

- **Keyword-permissiveness matches the dialect (and unbreaks generic readers).** In 2020-12 a keyword that doesn't apply to
  an instance's `type` is *ignored, not forbidden* — `{ type: "string", minItems: 3 }` is valid. So every variant carries all
  constraint keywords (`SchemaConstraints`), with `type` discriminating the instance type. This is both faithful to "what is
  possible" *and* what lets a generic reader (e.g. `@suluk/compat`'s v4→3.1 downgrade, which pulls `properties`/`required`
  off an unnarrowed schema) keep compiling without a per-`type` narrow. An earlier strict-per-variant model was rejected for
  breaking that reader — and for being *less* correct about the dialect.

## Consequences

- `@suluk/core` gains ~30 exported types (the Schema model + `Static` + document objects) and stays **zero-runtime-dependency**.
- The precise model is available for downstream generators to *adopt* (emit narrower request/response types, drive `Static`
  inference) but nothing is forced to — the flow-through `Schema` stays permissive by construction.
- **Deviation from C013's opacity is TYPE-LEVEL only.** Validation semantics are untouched; the meta-schema is unchanged bar a
  clarifying `$comment`. Honestly-low overall ceiling until published + a real downstream consumer narrows against it.
- **Deferred:** TypeBox (or Zod-v4 native JSON Schema) as an *authoring* primitive; tightening the document interfaces'
  `securitySchemes` value to the discriminated union; publishing `@suluk/core`.

Pairs with `plan/facts/0typed-schema-model.bn`.
