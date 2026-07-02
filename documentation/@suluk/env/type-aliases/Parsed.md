[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/env](../README.md) / Parsed

# Type Alias: Parsed\<S\>

> **Parsed**\<`S`\> = `{ [K in ParsedKeys<S>]: string }` & `{ [K in Exclude<keyof S, ParsedKeys<S>>]?: string }`

Defined in: [schema.ts:54](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/env/src/schema.ts#L54)

## Type Parameters

### S

`S` *extends* [`EnvSpec`](EnvSpec.md)
