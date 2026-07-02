[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / composeModules

# Function: composeModules()

> **composeModules**(`base`, `modules`): [`ComposeResult`](../interfaces/ComposeResult.md)

Defined in: [builder/src/compose.ts:98](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/builder/src/compose.ts#L98)

Install a set of modules in dependency order, returning the merged platform contract + a per-step trace.

## Parameters

### base

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### modules

[`SulukModule`](../interfaces/SulukModule.md)[]

## Returns

[`ComposeResult`](../interfaces/ComposeResult.md)
