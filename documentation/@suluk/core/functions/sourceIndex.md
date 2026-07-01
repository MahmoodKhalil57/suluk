[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / sourceIndex

# Function: sourceIndex()

> **sourceIndex**(`doc`): [`SourceGroup`](../interfaces/SourceGroup.md)[]

Defined in: [source.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/core/src/source.ts#L22)

The DERIVED reverse index: source pointer → the operations projected from it. Computed by walking the document;
never read back from stored doc state. One authored symbol (a Drizzle table, an operation function) typically
fans out to several operations (a table → its 5 CRUD ops), so this is the "what does this source drive?" lookup.

## Parameters

### doc

[`OpenAPIv4Document`](../interfaces/OpenAPIv4Document.md)

## Returns

[`SourceGroup`](../interfaces/SourceGroup.md)[]
