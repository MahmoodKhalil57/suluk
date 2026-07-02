[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/theme](../README.md) / TokenSpec

# Interface: TokenSpec

Defined in: [tokens.ts:46](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/theme/src/tokens.ts#L46)

One mode's tokens (light or dark).

## Properties

### breakpoints?

> `optional` **breakpoints?**: `Record`\<`string`, `string`\>

Defined in: [tokens.ts:60](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/theme/src/tokens.ts#L60)

named breakpoints → min-width (e.g. { md: "48rem" }).

***

### colors

> **colors**: [`ColorTokens`](ColorTokens.md)

Defined in: [tokens.ts:49](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/theme/src/tokens.ts#L49)

***

### fonts?

> `optional` **fonts?**: [`FontTokens`](FontTokens.md)

Defined in: [tokens.ts:52](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/theme/src/tokens.ts#L52)

***

### name

> **name**: `string`

Defined in: [tokens.ts:48](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/theme/src/tokens.ts#L48)

scheme name (e.g. "terracotta").

***

### radius

> **radius**: `number`

Defined in: [tokens.ts:51](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/theme/src/tokens.ts#L51)

base corner radius in rem (drives --radius and the derived sm/md/lg).

***

### shadows?

> `optional` **shadows?**: `Record`\<`string`, `string`\>

Defined in: [tokens.ts:54](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/theme/src/tokens.ts#L54)

named box-shadows → CSS shadow value.

***

### spacing?

> `optional` **spacing?**: `Record`\<`string`, `string`\>

Defined in: [tokens.ts:58](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/theme/src/tokens.ts#L58)

named spacing steps → length.

***

### typeScale?

> `optional` **typeScale?**: `Record`\<`string`, `string`\>

Defined in: [tokens.ts:56](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/theme/src/tokens.ts#L56)

named type-scale steps → font-size value (e.g. { base: "1rem", lg: "1.125rem" }).
