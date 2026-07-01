[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / swapProvider

# Function: swapProvider()

> **swapProvider**\<`T`\>(`doc`, `facet`, `impl`): [`SwapResult`](../../builder/interfaces/SwapResult.md)\<`T`\>

Defined in: [builder/src/providers.ts:80](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/builder/src/providers.ts#L80)

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

[`SwapResult`](../../builder/interfaces/SwapResult.md)\<`T`\>
