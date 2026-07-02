[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/env](../README.md) / Parsed

# Type Alias: Parsed\<S\>

> **Parsed**\<`S`\> = `{ [K in ParsedKeys<S>]: string }` & `{ [K in Exclude<keyof S, ParsedKeys<S>>]?: string }`

Defined in: [schema.ts:54](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/env/src/schema.ts#L54)

## Type Parameters

### S

`S` *extends* [`EnvSpec`](EnvSpec.md)
