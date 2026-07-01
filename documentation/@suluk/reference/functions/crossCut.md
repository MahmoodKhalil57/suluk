[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/reference](../README.md) / crossCut

# Function: crossCut()

> **crossCut**(`doc`, `viewers?`): `object`

Defined in: [reference/src/facets.ts:93](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/reference/src/facets.ts#L93)

The reachability matrix: every operation × every viewer. The projection made explicit (the contract refracted).

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### viewers?

[`Viewer`](../interfaces/Viewer.md)[] = `DEFAULT_VIEWERS`

## Returns

`object`

### rows

> **rows**: [`CrossCutRow`](../interfaces/CrossCutRow.md)[]

### viewers

> **viewers**: [`Viewer`](../interfaces/Viewer.md)[]
