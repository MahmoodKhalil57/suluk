[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/visual](../README.md) / contentHash

# Variable: contentHash

> `const` **contentHash**: (`input`) => `string` = `hash`

Defined in: [baseline.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/visual/src/baseline.ts#L20)

Hash of the render-affecting source of a primitive (its component code, variant, tokens).

Stable, fast, non-cryptographic hash (djb2) of source text or raw bytes — for change detection only.

## Parameters

### input

`string` \| `Uint8Array`\<`ArrayBufferLike`\>

## Returns

`string`
