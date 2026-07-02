[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / planComposition

# Function: planComposition()

> **planComposition**(`base`, `modules`): [`CompositionPlan`](../interfaces/CompositionPlan.md)

Defined in: [builder/src/compose.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/builder/src/compose.ts#L30)

Topologically order modules by `requires`/`provides`, modelling the collision invariants installModule enforces.

## Parameters

### base

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### modules

[`SulukModule`](../interfaces/SulukModule.md)[]

## Returns

[`CompositionPlan`](../interfaces/CompositionPlan.md)
