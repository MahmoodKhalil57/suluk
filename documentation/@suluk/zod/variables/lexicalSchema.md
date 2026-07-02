[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/zod](../README.md) / lexicalSchema

# Variable: lexicalSchema

> `const` **lexicalSchema**: `ZodObject`\<\{ `root`: `ZodObject`\<\{ `children`: `ZodArray`\<`ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>\>; `direction`: `ZodOptional`\<`ZodUnion`\<readonly \[`ZodLiteral`\<`"ltr"`\>, `ZodLiteral`\<`"rtl"`\>, `ZodNull`\]\>\>; `format`: `ZodOptional`\<`ZodUnion`\<readonly \[`ZodString`, `ZodNumber`\]\>\>; `indent`: `ZodOptional`\<`ZodNumber`\>; `type`: `ZodLiteral`\<`"root"`\>; `version`: `ZodOptional`\<`ZodNumber`\>; \}, `$loose`\>; \}, `$loose`\>

Defined in: [lexical.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/zod/src/lexical.ts#L24)

The serialized Lexical editor state — `{ root: { children: [...] } }`. The storage shape of a richtext field.
