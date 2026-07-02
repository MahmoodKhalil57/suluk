[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/i18n](../README.md) / NamespaceLoaders

# Type Alias: NamespaceLoaders\<M\>

> **NamespaceLoaders**\<`M`\> = `Record`\<`string`, () => `Promise`\<\{ `default`: `M`; \}\>\>

Defined in: [messages.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/i18n/src/messages.ts#L31)

Per-locale loaders for ONE namespace: locale code → a dynamic-import thunk returning `{ default: catalog }`.

## Type Parameters

### M

`M`
