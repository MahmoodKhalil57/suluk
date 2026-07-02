[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / scrubSource

# Function: scrubSource()

> **scrubSource**(`doc`): [`OpenAPIv4Document`](../interfaces/OpenAPIv4Document.md)

Defined in: [source.ts:53](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/core/src/source.ts#L53)

Return a CLONE of the document with every `x-suluk-source` removed — for externally published projections, where
a source pointer is internal-layout disclosure (council: scrub from external). Shallow-clones paths/requests so
the canonical (which keeps provenance for the maintainer view) is never mutated.

## Parameters

### doc

[`OpenAPIv4Document`](../interfaces/OpenAPIv4Document.md)

## Returns

[`OpenAPIv4Document`](../interfaces/OpenAPIv4Document.md)
