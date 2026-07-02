[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / swapProvider

# Function: swapProvider()

> **swapProvider**\<`T`\>(`doc`, `facet`, `impl`): [`SwapResult`](../interfaces/SwapResult.md)\<`T`\>

Defined in: [providers.ts:80](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/builder/src/providers.ts#L80)

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
