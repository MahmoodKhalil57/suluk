[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / CompositionSurface

# Interface: CompositionSurface

Defined in: [service.ts:98](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/platform/src/service.ts#L98)

What a service brings to the composition graph: the ports it exposes + the capabilities it offers.

## Properties

### exposes?

> `optional` **exposes?**: `Record`\<`string`, [`Port`](Port.md)\<`unknown`\>\>

Defined in: [service.ts:99](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/platform/src/service.ts#L99)

***

### offers?

> `optional` **offers?**: `Record`\<`string`, [`Capability`](Capability.md)\<`unknown`\>\>

Defined in: [service.ts:100](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/platform/src/service.ts#L100)
