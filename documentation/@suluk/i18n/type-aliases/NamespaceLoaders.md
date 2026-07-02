[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/i18n](../README.md) / NamespaceLoaders

# Type Alias: NamespaceLoaders\<M\>

> **NamespaceLoaders**\<`M`\> = `Record`\<`string`, () => `Promise`\<\{ `default`: `M`; \}\>\>

Defined in: [messages.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/i18n/src/messages.ts#L31)

Per-locale loaders for ONE namespace: locale code → a dynamic-import thunk returning `{ default: catalog }`.

## Type Parameters

### M

`M`
