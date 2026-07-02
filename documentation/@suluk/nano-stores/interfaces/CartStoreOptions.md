[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/nano-stores](../README.md) / CartStoreOptions

# Interface: CartStoreOptions

Defined in: [tooling/ts/packages/nano-stores/src/cart.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/nano-stores/src/cart.ts#L34)

## Properties

### changeEvent?

> `optional` **changeEvent?**: `string`

Defined in: [tooling/ts/packages/nano-stores/src/cart.ts:52](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/nano-stores/src/cart.ts#L52)

Same-tab change-notification event name (default "cart-changed"). Non-store writers that mutate the same
localStorage key by hand should `dispatchEvent(new Event(changeEvent))` after writing, so the store (and the
UI it drives) refresh without a reload — the native `storage` event does NOT fire in the writing tab.

***

### events?

> `optional` **events?**: `Pick`\<`EventTarget`, `"addEventListener"` \| `"removeEventListener"` \| `"dispatchEvent"`\> \| `null`

Defined in: [tooling/ts/packages/nano-stores/src/cart.ts:46](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/nano-stores/src/cart.ts#L46)

Event target for cross-tab + same-tab sync (default `globalThis`). The store LISTENS for the native
`storage` event (fires in OTHER tabs) and for `changeEvent` (same tab). Pass `null` to disable syncing.

***

### storage?

> `optional` **storage?**: `Pick`\<`Storage`, `"getItem"` \| `"setItem"`\> \| `null`

Defined in: [tooling/ts/packages/nano-stores/src/cart.ts:41](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/nano-stores/src/cart.ts#L41)

Persistence backend. Defaults to `globalThis.localStorage` when present, else an in-memory shim (so the
store is usable in SSR/build/tests without throwing). Pass a mock in tests.

***

### storageKey?

> `optional` **storageKey?**: `string`

Defined in: [tooling/ts/packages/nano-stores/src/cart.ts:36](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/nano-stores/src/cart.ts#L36)

localStorage key (default "cart").
