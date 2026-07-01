[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/nano-stores](../README.md) / CreateApiStoresOptions

# Interface: CreateApiStoresOptions

Defined in: [tooling/ts/packages/nano-stores/src/stores.ts:74](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/nano-stores/src/stores.ts#L74)

## Properties

### action?

> `optional` **action?**: `string` \| (() => `string` \| `undefined`)

Defined in: [tooling/ts/packages/nano-stores/src/stores.ts:84](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/nano-stores/src/stores.ts#L84)

The current frontend ACTION (a button-click id), sent as `x-suluk-action` on every request so the
server's cost meter (@suluk/cost) can attribute cost back to the UI action. A function lets it reflect
the live action. A per-call action on `.mutate({ action })` overrides it.

***

### baseUrl?

> `optional` **baseUrl?**: `string`

Defined in: [tooling/ts/packages/nano-stores/src/stores.ts:76](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/nano-stores/src/stores.ts#L76)

Prepended to every built URL (e.g. "https://api.example.com").

***

### fetch?

> `optional` **fetch?**: *typeof* `fetch`

Defined in: [tooling/ts/packages/nano-stores/src/stores.ts:78](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/nano-stores/src/stores.ts#L78)

Injected fetch — defaults to the global. Tests pass a recording mock.
