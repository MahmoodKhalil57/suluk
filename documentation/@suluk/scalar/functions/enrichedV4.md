[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/scalar](../README.md) / enrichedV4

# Function: enrichedV4()

> **enrichedV4**(`doc`, `opts?`): `object`

Defined in: [index.ts:190](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/scalar/src/index.ts#L190)

Enrich a v4 document with the suluk facets (badges + detail + intro) WITHOUT downgrading — for the forked Scalar
 that ingests v4 NATIVELY. Never mutates `doc` (JSON-clone first). The output is fed to Scalar's `content` as-is.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### opts?

#### facetBadges?

`boolean`

## Returns

`object`

### spec

> **spec**: `Record`\<`string`, `unknown`\>
