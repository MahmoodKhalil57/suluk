[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/nano-stores](../README.md) / DiscountStoreOptions

# Interface: DiscountStoreOptions

Defined in: [tooling/ts/packages/nano-stores/src/discount.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/nano-stores/src/discount.ts#L19)

## Properties

### changeEvent?

> `optional` **changeEvent?**: `string`

Defined in: [tooling/ts/packages/nano-stores/src/discount.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/nano-stores/src/discount.ts#L27)

same-tab change-event name (default "discount-changed").

***

### events?

> `optional` **events?**: `Pick`\<`EventTarget`, `"addEventListener"` \| `"removeEventListener"` \| `"dispatchEvent"`\> \| `null`

Defined in: [tooling/ts/packages/nano-stores/src/discount.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/nano-stores/src/discount.ts#L25)

sync event target (default globalThis; null disables).

***

### storage?

> `optional` **storage?**: `Pick`\<`Storage`, `"getItem"` \| `"setItem"` \| `"removeItem"`\> \| `null`

Defined in: [tooling/ts/packages/nano-stores/src/discount.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/nano-stores/src/discount.ts#L23)

persistence backend (default globalThis.localStorage, else in-memory; null → in-memory).

***

### storageKey?

> `optional` **storageKey?**: `string`

Defined in: [tooling/ts/packages/nano-stores/src/discount.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/nano-stores/src/discount.ts#L21)

localStorage key (default "discount").
