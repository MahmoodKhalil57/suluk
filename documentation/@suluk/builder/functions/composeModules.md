[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / composeModules

# Function: composeModules()

> **composeModules**(`base`, `modules`): [`ComposeResult`](../interfaces/ComposeResult.md)

Defined in: [compose.ts:98](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/builder/src/compose.ts#L98)

Install a set of modules in dependency order, returning the merged platform contract + a per-step trace.

## Parameters

### base

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### modules

[`SulukModule`](../interfaces/SulukModule.md)[]

## Returns

[`ComposeResult`](../interfaces/ComposeResult.md)
