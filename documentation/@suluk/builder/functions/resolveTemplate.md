[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / resolveTemplate

# Function: resolveTemplate()

> **resolveTemplate**(`t`, `registry?`): `object`

Defined in: [modules/index.ts:47](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/builder/src/modules/index.ts#L47)

Resolve a template's module names to actual modules from a registry — REPORTING any name that doesn't resolve
 (a typo or a module missing from this registry) rather than silently dropping it.

## Parameters

### t

[`StackTemplate`](../interfaces/StackTemplate.md)

### registry?

[`ModuleRegistry`](../interfaces/ModuleRegistry.md) = `FIRST_PARTY_REGISTRY`

## Returns

`object`

### missing

> **missing**: `string`[]

### modules

> **modules**: [`SulukModule`](../interfaces/SulukModule.md)[]
