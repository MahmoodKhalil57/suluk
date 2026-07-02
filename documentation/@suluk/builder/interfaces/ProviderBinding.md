[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / ProviderBinding

# Interface: ProviderBinding

Defined in: [providers.ts:47](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/builder/src/providers.ts#L47)

## Properties

### alternatives

> **alternatives**: [`ProviderImpl`](ProviderImpl.md)[]

Defined in: [providers.ts:55](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/builder/src/providers.ts#L55)

the other implementations this slot could swap to

***

### facet

> **facet**: `string`

Defined in: [providers.ts:48](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/builder/src/providers.ts#L48)

***

### impl

> **impl**: `string`

Defined in: [providers.ts:50](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/builder/src/providers.ts#L50)

the currently-bound implementation id

***

### known

> **known**: `boolean`

Defined in: [providers.ts:53](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/builder/src/providers.ts#L53)

is `impl` a known implementation for this facet? (false ⇒ a custom binding)

***

### title

> **title**: `string`

Defined in: [providers.ts:51](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/builder/src/providers.ts#L51)
