[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / ProviderBinding

# Interface: ProviderBinding

Defined in: [builder/src/providers.ts:47](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/builder/src/providers.ts#L47)

## Properties

### alternatives

> **alternatives**: [`ProviderImpl`](ProviderImpl.md)[]

Defined in: [builder/src/providers.ts:55](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/builder/src/providers.ts#L55)

the other implementations this slot could swap to

***

### facet

> **facet**: `string`

Defined in: [builder/src/providers.ts:48](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/builder/src/providers.ts#L48)

***

### impl

> **impl**: `string`

Defined in: [builder/src/providers.ts:50](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/builder/src/providers.ts#L50)

the currently-bound implementation id

***

### known

> **known**: `boolean`

Defined in: [builder/src/providers.ts:53](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/builder/src/providers.ts#L53)

is `impl` a known implementation for this facet? (false ⇒ a custom binding)

***

### title

> **title**: `string`

Defined in: [builder/src/providers.ts:51](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/builder/src/providers.ts#L51)
