[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / planComposition

# Function: planComposition()

> **planComposition**(`base`, `modules`): [`CompositionPlan`](../interfaces/CompositionPlan.md)

Defined in: [compose.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/builder/src/compose.ts#L30)

Topologically order modules by `requires`/`provides`, modelling the collision invariants installModule enforces.

## Parameters

### base

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### modules

[`SulukModule`](../interfaces/SulukModule.md)[]

## Returns

[`CompositionPlan`](../interfaces/CompositionPlan.md)
