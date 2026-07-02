[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/i18n](../README.md) / NamespaceLoaders

# Type Alias: NamespaceLoaders\<M\>

> **NamespaceLoaders**\<`M`\> = `Record`\<`string`, () => `Promise`\<\{ `default`: `M`; \}\>\>

Defined in: [messages.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/i18n/src/messages.ts#L31)

Per-locale loaders for ONE namespace: locale code → a dynamic-import thunk returning `{ default: catalog }`.

## Type Parameters

### M

`M`
