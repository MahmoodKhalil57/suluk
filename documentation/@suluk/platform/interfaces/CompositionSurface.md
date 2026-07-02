[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / CompositionSurface

# Interface: CompositionSurface

Defined in: [service.ts:100](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/platform/src/service.ts#L100)

What a service brings to the composition graph: the ports it exposes + the capabilities it offers.

## Properties

### exposes?

> `optional` **exposes?**: `Record`\<`string`, [`Port`](Port.md)\<`unknown`\>\>

Defined in: [service.ts:101](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/platform/src/service.ts#L101)

***

### offers?

> `optional` **offers?**: `Record`\<`string`, [`Capability`](Capability.md)\<`unknown`\>\>

Defined in: [service.ts:102](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/platform/src/service.ts#L102)
