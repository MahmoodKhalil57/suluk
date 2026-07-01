[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / swapProvider

# Function: swapProvider()

> **swapProvider**\<`T`\>(`doc`, `facet`, `impl`): [`SwapResult`](../interfaces/SwapResult.md)\<`T`\>

Defined in: [providers.ts:80](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/builder/src/providers.ts#L80)

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
