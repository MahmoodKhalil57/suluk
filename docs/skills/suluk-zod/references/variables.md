# Variables & Constants

## lexical

### `lexicalSchema`
The serialized Lexical editor state — `{ root: { children: [...] } }`. The storage shape of a richtext field.
```ts
const lexicalSchema: ZodObject<{ root: ZodObject<{ type: ZodLiteral<"root">; children: ZodArray<ZodType<unknown, unknown, $ZodTypeInternals<unknown, unknown>>>; direction: ZodOptional<ZodUnion<readonly [ZodLiteral<"ltr">, ZodLiteral<"rtl">, ZodNull]>>; format: ZodOptional<ZodUnion<readonly [ZodString, ZodNumber]>>; indent: ZodOptional<ZodNumber>; version: ZodOptional<ZodNumber> }, $loose> }, $loose>
```

### `lexicalNodeSchema`
A single Lexical node — recursive + open (each node type carries its own extra fields; we keep the common ones).
```ts
const lexicalNodeSchema: z.ZodType
```

### `LEXICAL_V4_SCHEMA`
The v4 (JSON Schema 2020-12) projection of a Lexical state — recursive via a `$defs.lexicalNode` self-`$ref`.
Drop it onto a property (or `$ref` it from components) to declare a richtext field in a contract. Frozen.
```ts
const LEXICAL_V4_SCHEMA: Readonly<{ type: "object"; title: "LexicalState"; description: "A serialized Lexical rich-text editor state."; x-suluk-widget: "richtext"; properties: { root: { type: string; properties: { type: { const: string }; children: { type: string; items: { $ref: string } }; direction: { type: string[]; enum: (string | null)[] }; format: { type: string[] }; indent: { type: string }; version: { type: string } }; required: string[] } }; required: string[]; $defs: { lexicalNode: { type: string; properties: { type: { type: string }; version: { type: string }; children: { type: string; items: { $ref: string } }; text: { type: string }; format: { type: string[] } }; required: string[] } } }>
```
