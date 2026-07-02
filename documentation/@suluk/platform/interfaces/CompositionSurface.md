[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / CompositionSurface

# Interface: CompositionSurface

Defined in: [service.ts:103](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/platform/src/service.ts#L103)

What a service brings to the composition graph: the ports it exposes + the capabilities it offers.

## Properties

### exposes?

> `optional` **exposes?**: `Record`\<`string`, [`Port`](Port.md)\<`unknown`\>\>

Defined in: [service.ts:104](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/platform/src/service.ts#L104)

***

### offers?

> `optional` **offers?**: `Record`\<`string`, [`Capability`](Capability.md)\<`unknown`\>\>

Defined in: [service.ts:105](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/platform/src/service.ts#L105)
