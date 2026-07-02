[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/zod](../README.md) / V4ToZodOptions

# Interface: V4ToZodOptions

Defined in: [to-zod.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/zod/src/to-zod.ts#L13)

## Properties

### defs?

> `optional` **defs?**: `Record`\<`string`, `unknown`\> \| ((`ref`) => `unknown`)

Defined in: [to-zod.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/zod/src/to-zod.ts#L15)

Resolver for `$ref`: a map of pointer → schema, or a function. Supports "#/$defs/X", "#/components/schemas/X".
