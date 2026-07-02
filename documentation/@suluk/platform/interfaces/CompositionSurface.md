[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / CompositionSurface

# Interface: CompositionSurface

Defined in: [service.ts:98](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/service.ts#L98)

What a service brings to the composition graph: the ports it exposes + the capabilities it offers.

## Properties

### exposes?

> `optional` **exposes?**: `Record`\<`string`, [`Port`](Port.md)\<`unknown`\>\>

Defined in: [service.ts:99](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/service.ts#L99)

***

### offers?

> `optional` **offers?**: `Record`\<`string`, [`Capability`](Capability.md)\<`unknown`\>\>

Defined in: [service.ts:100](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/platform/src/service.ts#L100)
