[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / ContextOptions

# Interface: ContextOptions

Defined in: [agents/src/context.ts:104](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/agents/src/context.ts#L104)

## Properties

### catalog?

> `optional` **catalog?**: [`ModelCatalog`](ModelCatalog.md)

Defined in: [agents/src/context.ts:107](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/agents/src/context.ts#L107)

the model catalog (@suluk/models) — context windows are read from it; replaces the old hard-coded table.

***

### instructions?

> `optional` **instructions?**: `Record`\<`string`, `string`\>

Defined in: [agents/src/context.ts:105](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/agents/src/context.ts#L105)

***

### modelWindows?

> `optional` **modelWindows?**: `Record`\<`string`, `number`\>

Defined in: [agents/src/context.ts:109](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/agents/src/context.ts#L109)

per-id window overrides (takes precedence over the catalog); handy for tests/pins.
