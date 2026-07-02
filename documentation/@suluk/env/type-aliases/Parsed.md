[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/env](../README.md) / Parsed

# Type Alias: Parsed\<S\>

> **Parsed**\<`S`\> = `{ [K in ParsedKeys<S>]: string }` & `{ [K in Exclude<keyof S, ParsedKeys<S>>]?: string }`

Defined in: [schema.ts:54](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/env/src/schema.ts#L54)

## Type Parameters

### S

`S` *extends* [`EnvSpec`](EnvSpec.md)
