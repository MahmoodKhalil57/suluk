[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/reference](../README.md) / crossCut

# Function: crossCut()

> **crossCut**(`doc`, `viewers?`): `object`

Defined in: [reference/src/facets.ts:93](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/reference/src/facets.ts#L93)

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
