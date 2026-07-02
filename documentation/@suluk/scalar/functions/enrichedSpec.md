[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/scalar](../README.md) / enrichedSpec

# Function: enrichedSpec()

> **enrichedSpec**(`doc`, `opts?`): `object`

Defined in: [index.ts:153](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/scalar/src/index.ts#L153)

Project a v4 document to the 3.1 spec Scalar consumes, ENRICHED with the v4 facets (cost/access → badges + detail
 + intro). The standalone (+ the /reference composite's view-as endpoint) both serve this. Never mutates `doc`.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### opts?

#### facetBadges?

`boolean`

## Returns

`object`

### diagnostics

> **diagnostics**: [`Diagnostic`](../../openapi-compat/interfaces/Diagnostic.md)[]

### spec

> **spec**: `Record`\<`string`, `unknown`\>
