[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/zod](../README.md) / lexicalSchema

# Variable: lexicalSchema

> `const` **lexicalSchema**: `ZodObject`\<\{ `root`: `ZodObject`\<\{ `children`: `ZodArray`\<`ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>\>; `direction`: `ZodOptional`\<`ZodUnion`\<readonly \[`ZodLiteral`\<`"ltr"`\>, `ZodLiteral`\<`"rtl"`\>, `ZodNull`\]\>\>; `format`: `ZodOptional`\<`ZodUnion`\<readonly \[`ZodString`, `ZodNumber`\]\>\>; `indent`: `ZodOptional`\<`ZodNumber`\>; `type`: `ZodLiteral`\<`"root"`\>; `version`: `ZodOptional`\<`ZodNumber`\>; \}, `$loose`\>; \}, `$loose`\>

Defined in: [lexical.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/zod/src/lexical.ts#L24)

The serialized Lexical editor state — `{ root: { children: [...] } }`. The storage shape of a richtext field.
