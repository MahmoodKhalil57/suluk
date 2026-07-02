[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/visual](../README.md) / contentHash

# Variable: contentHash

> `const` **contentHash**: (`input`) => `string` = `hash`

Defined in: [baseline.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/visual/src/baseline.ts#L20)

Hash of the render-affecting source of a primitive (its component code, variant, tokens).

Stable, fast, non-cryptographic hash (djb2) of source text or raw bytes — for change detection only.

## Parameters

### input

`string` \| `Uint8Array`\<`ArrayBufferLike`\>

## Returns

`string`
