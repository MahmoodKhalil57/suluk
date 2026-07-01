[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/env](../README.md) / Parsed

# Type Alias: Parsed\<S\>

> **Parsed**\<`S`\> = `{ [K in ParsedKeys<S>]: string }` & `{ [K in Exclude<keyof S, ParsedKeys<S>>]?: string }`

Defined in: [schema.ts:54](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/env/src/schema.ts#L54)

## Type Parameters

### S

`S` *extends* [`EnvSpec`](EnvSpec.md)
