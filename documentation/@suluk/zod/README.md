[**Suluk**](../../README.md)

***

[Suluk](../../packages.md) / @suluk/zod

<p align="center">
  <a href="https://github.com/MahmoodKhalil57/suluk">
    <img src="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/wordmark.png" alt="Suluk" width="360" />
  </a>
</p>

<h1 align="center">@suluk/zod</h1>

<p align="center"><b>Lossless-where-representable conversion between Zod schemas and OpenAPI v4 "Suluk" Schema Objects — Zod is the source of truth, v4 is the interchange.</b></p>

---

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```sh
bun add @suluk/zod
```

`zod@^4` is a peer dependency — bring your own.

## What it does

A v4 Schema Object **is** JSON Schema 2020-12, and Zod 4 emits exactly that. This package is the thin,
honest bridge between the two:

- **`zodToV4(schema)`** — emit a v4 Schema Object from a Zod schema (strips the embedded `$schema`
  dialect marker, since v4 declares the dialect once at the document level).
- **`v4ToZod(schema)`** — rebuild a runnable Zod schema from a v4 Schema Object, resolving `$ref`
  against an optional defs map.
- **Lossless over the representable subset** — the pair is a proven *fixpoint*: for any Zod schema `s`,
  `zodToV4(v4ToZod(zodToV4(s)))` deep-equals `zodToV4(s)`.
- **Honest about loss** — Zod runtime effects JSON Schema can't express (`.transform`, `.refine`,
  `.superRefine`, `.check`) are **reported in `zodToV4().warnings`**, never dropped silently. A plain
  representable schema yields an empty `warnings` array.
- **Lexical rich-text typing** — a ready-made Zod type and a hand-authored v4 projection for a serialized
  Lexical editor state, so a `richtext` field validates, infers, and renders.

## When to reach for it

Reach for `@suluk/zod` when you have Zod schemas and need v4 Schema Objects, or vice versa. It's the
schema backbone underneath `@suluk/hono` (route schemas → contract) and `@suluk/drizzle` (table schemas →
contract) — both call `zodToV4` directly.

- Use **`@suluk/zod`** for the *Schema Object* layer (the `properties`/`type` JSON-Schema fragments).
- Use **`@suluk/core`** for the whole v4 *document* (parse, validate, resolve `$ref`, signature, path
  matching).
- Use **`@suluk/openapi-compat`** for *whole-document* 3.1 ⇄ v4 conversion — a different axis than the
  Zod ⇄ Schema-Object conversion here.

## Usage

### Zod → v4 Schema Object

```ts
import { zodToV4 } from "@suluk/zod";
import * as z from "zod";

const User = z.object({
  name: z.string().min(2),
  email: z.email(),
  age: z.number().int().optional(),
  role: z.enum(["admin", "user"]),
});

const { schema, warnings } = zodToV4(User);
// schema  → a v4 Schema Object (JSON Schema 2020-12), no `$schema` marker
// warnings → [] (fully lossless — nothing was dropped)
```

`io` picks the input vs output projection for schemas with defaults/transforms (`"output"` is the
default — the shape *after* parsing):

```ts
zodToV4(z.string().default("x"), { io: "input" });
```

The lossy boundary is enumerated, not silent — `.transform`/`.refine` and friends surface in `warnings`:

```ts
const { warnings } = zodToV4(z.string().refine((s) => s.length > 3));
// warnings → ["custom refinement dropped (not representable in JSON Schema)"]
// the base `{ type: "string" }` is still emitted; the predicate is reported, not lost
```

### v4 Schema Object → Zod

```ts
import { v4ToZod } from "@suluk/zod";

const Pet = v4ToZod({
  type: "object",
  properties: { name: { type: "string" }, tags: { type: "array", items: { type: "string" } } },
  required: ["name"],
});

Pet.safeParse({ name: "Rex", tags: ["good"] }).success; // → true
Pet.safeParse({}).success;                              // → false (name required)
```

Resolve `$ref` by passing a `defs` map (or a resolver function) — keys match the full pointer or the
trailing name (`#/components/schemas/Pet`, `#/$defs/Pet`):

```ts
const zt = v4ToZod(
  { $ref: "#/components/schemas/Pet" },
  { defs: { Pet: { type: "object", properties: { name: { type: "string" } }, required: ["name"] } } },
);
```

### Lexical rich-text

Type a stored richtext value, and drop the v4 projection onto a property in a contract:

```ts
import { lexicalSchema, LEXICAL_V4_SCHEMA, type LexicalState } from "@suluk/zod";

const state: LexicalState = lexicalSchema.parse(storedEditorState); // validates the recursive node tree

// In a contract, declare a richtext field by referencing the frozen v4 projection
// (recursive via a `$defs.lexicalNode` self-`$ref`; carries `x-suluk-widget: "richtext"`):
const Post = {
  type: "object",
  properties: { body: LEXICAL_V4_SCHEMA },
  required: ["body"],
};
```

## API

| Export | Kind | What it does |
| --- | --- | --- |
| `zodToV4(schema, { io? })` | fn | Zod schema → `{ schema, warnings }` v4 Schema Object |
| `v4ToZod(schema, { defs? })` | fn | v4 Schema Object → runnable Zod schema (`$ref`-resolving) |
| `convert(node, opts?)` | fn | the recursive core of `v4ToZod` — convert one JSON-Schema node |
| `ZodToV4Result` | type | `{ schema: Record<string, unknown>; warnings: string[] }` |
| `V4ToZodOptions` | type | `{ defs?: Record<string, unknown> \| ((ref: string) => unknown) }` |
| `lexicalSchema` | Zod | the serialized Lexical editor state — `{ root: { children: [...] } }` |
| `lexicalNodeSchema` | Zod | a single recursive Lexical node (open / passthrough) |
| `LexicalState` | type | `z.infer<typeof lexicalSchema>` |
| `LEXICAL_V4_SCHEMA` | const | frozen v4 projection of a Lexical state (`x-suluk-widget: "richtext"`) |

## Boundary

This package converts the **schema layer** only — the JSON-Schema fragment, not the surrounding v4
document. It emits and ingests Schema Objects; assembling them into a document (paths, components,
`info`, the `4.0.0-candidate` identity) and validating that document is `@suluk/core`'s job.

Conversion is **lossless over the JSON-Schema-representable subset**. Where Zod expresses runtime logic
JSON Schema cannot (`.transform`, `.refine`), the contract is to **report it in `warnings`** so the caller
decides what to do — never to drop it silently. New mappings for unrepresentable constructs belong here,
behind that same honest-loss contract, not in the callers that depend on it.

## License

Apache-2.0

## Interfaces

- [V4ToZodOptions](interfaces/V4ToZodOptions.md)
- [ZodToV4Result](interfaces/ZodToV4Result.md)

## Type Aliases

- [LexicalState](type-aliases/LexicalState.md)

## Variables

- [LEXICAL\_V4\_SCHEMA](variables/LEXICAL_V4_SCHEMA.md)
- [lexicalNodeSchema](variables/lexicalNodeSchema.md)
- [lexicalSchema](variables/lexicalSchema.md)

## Functions

- [convert](functions/convert.md)
- [v4ToZod](functions/v4ToZod.md)
- [zodToV4](functions/zodToV4.md)
