[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/docs](../README.md) / packageGraphData

# Function: packageGraphData()

> **packageGraphData**(`packages`): [`PackageGraph`](../interfaces/PackageGraph.md)

Defined in: [diagram.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/docs/src/diagram.ts#L25)

The `@suluk` package dependency graph as pure data (each package → its drawn `@suluk` dependencies) — the input
to the d3 renderer (build tooling), replacing the old D2/kroki path. Zero-dep, so it stays in `@suluk/docs`.

## Parameters

### packages

[`PackageDoc`](../interfaces/PackageDoc.md)[]

## Returns

[`PackageGraph`](../interfaces/PackageGraph.md)
