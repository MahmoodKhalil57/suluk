[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/docs](../README.md) / architectureGraphData

# Function: architectureGraphData()

> **architectureGraphData**(`packages`): [`ArchitectureGraph`](../interfaces/ArchitectureGraph.md)

Defined in: [diagram.ts:58](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/docs/src/diagram.ts#L58)

The `@suluk` graph enriched for the UML "Strata-of-Derivation" architecture diagram: each package carries its
export count + a sample of export names so the renderer can draw a UML class-box (name + members compartment)
per package, and the same `@suluk`-only dependency edges as [packageGraphData](packageGraphData.md). Pure data, zero-dep —
the layout/stereotypes/colours live in the build-tooling renderer (`scripts/pkggraph.ts`).

## Parameters

### packages

[`PackageDoc`](../interfaces/PackageDoc.md)[]

## Returns

[`ArchitectureGraph`](../interfaces/ArchitectureGraph.md)
