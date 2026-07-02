[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/visual](../README.md) / snapshotHash

# Variable: snapshotHash

> `const` **snapshotHash**: (`input`) => `string` = `hash`

Defined in: [baseline.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/visual/src/baseline.ts#L22)

Hash of an approved screenshot's bytes — the recorded identity of "what was verified".

Stable, fast, non-cryptographic hash (djb2) of source text or raw bytes — for change detection only.

## Parameters

### input

`string` \| `Uint8Array`\<`ArrayBufferLike`\>

## Returns

`string`
