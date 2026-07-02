[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/i18n](../README.md) / loadMessages

# Function: loadMessages()

> **loadMessages**\<`M`\>(`loaders`, `locale`, `defaultLocale`): `Promise`\<`M`\>

Defined in: [messages.ts:38](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/i18n/src/messages.ts#L38)

Load a namespace's catalog for a locale, falling back to the DEFAULT locale's chunk when the locale is missing
(saastarter's `nsLoaders[locale] ?? nsLoaders.en`, i18n.ts:189 — generalized to any default). Only the resolved
chunk is imported (tree-shakeable). Throws only if NEITHER the locale nor the default has a loader (a config bug).

## Type Parameters

### M

`M`

## Parameters

### loaders

[`NamespaceLoaders`](../type-aliases/NamespaceLoaders.md)\<`M`\>

### locale

`string`

### defaultLocale

`string`

## Returns

`Promise`\<`M`\>
