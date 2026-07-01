[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/i18n](../README.md) / NamespaceLoaders

# Type Alias: NamespaceLoaders\<M\>

> **NamespaceLoaders**\<`M`\> = `Record`\<`string`, () => `Promise`\<\{ `default`: `M`; \}\>\>

Defined in: [messages.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/i18n/src/messages.ts#L31)

Per-locale loaders for ONE namespace: locale code → a dynamic-import thunk returning `{ default: catalog }`.

## Type Parameters

### M

`M`
