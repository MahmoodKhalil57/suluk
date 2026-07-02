[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / swapProvider

# Function: swapProvider()

> **swapProvider**\<`T`\>(`doc`, `facet`, `impl`): [`SwapResult`](../interfaces/SwapResult.md)\<`T`\>

Defined in: [providers.ts:80](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/builder/src/providers.ts#L80)

Rebind a facet's slot to another implementation of the same interface. Returns the unchanged doc on error.

## Type Parameters

### T

`T`

## Parameters

### doc

`T`

### facet

`string`

### impl

`string`

## Returns

[`SwapResult`](../interfaces/SwapResult.md)\<`T`\>
