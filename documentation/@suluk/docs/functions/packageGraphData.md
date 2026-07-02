[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/docs](../README.md) / packageGraphData

# Function: packageGraphData()

> **packageGraphData**(`packages`): [`PackageGraph`](../interfaces/PackageGraph.md)

Defined in: [diagram.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/docs/src/diagram.ts#L25)

The `@suluk` package dependency graph as pure data (each package → its drawn `@suluk` dependencies) — the input
to the d3 renderer (build tooling), replacing the old D2/kroki path. Zero-dep, so it stays in `@suluk/docs`.

## Parameters

### packages

[`PackageDoc`](../interfaces/PackageDoc.md)[]

## Returns

[`PackageGraph`](../interfaces/PackageGraph.md)
