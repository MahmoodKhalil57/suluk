[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/visual](../README.md) / contentHash

# Variable: contentHash

> `const` **contentHash**: (`input`) => `string` = `hash`

Defined in: [baseline.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/visual/src/baseline.ts#L20)

Hash of the render-affecting source of a primitive (its component code, variant, tokens).

Stable, fast, non-cryptographic hash (djb2) of source text or raw bytes — for change detection only.

## Parameters

### input

`string` \| `Uint8Array`\<`ArrayBufferLike`\>

## Returns

`string`
