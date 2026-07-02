[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/zod](../README.md) / LEXICAL\_V4\_SCHEMA

# Variable: LEXICAL\_V4\_SCHEMA

> `const` **LEXICAL\_V4\_SCHEMA**: `Readonly`\<\{ `$defs`: \{ `lexicalNode`: \{ `properties`: \{ `children`: \{ `items`: \{ `$ref`: `string`; \}; `type`: `string`; \}; `format`: \{ `type`: `string`[]; \}; `text`: \{ `type`: `string`; \}; `type`: \{ `type`: `string`; \}; `version`: \{ `type`: `string`; \}; \}; `required`: `string`[]; `type`: `string`; \}; \}; `description`: `"A serialized Lexical rich-text editor state."`; `properties`: \{ `root`: \{ `properties`: \{ `children`: \{ `items`: \{ `$ref`: `string`; \}; `type`: `string`; \}; `direction`: \{ `enum`: (`string` \| `null`)[]; `type`: `string`[]; \}; `format`: \{ `type`: `string`[]; \}; `indent`: \{ `type`: `string`; \}; `type`: \{ `const`: `string`; \}; `version`: \{ `type`: `string`; \}; \}; `required`: `string`[]; `type`: `string`; \}; \}; `required`: `string`[]; `title`: `"LexicalState"`; `type`: `"object"`; `x-suluk-widget`: `"richtext"`; \}\>

Defined in: [lexical.ts:45](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/zod/src/lexical.ts#L45)

The v4 (JSON Schema 2020-12) projection of a Lexical state — recursive via a `$defs.lexicalNode` self-`$ref`.
Drop it onto a property (or `$ref` it from components) to declare a richtext field in a contract. Frozen.
