[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / installModule

# Function: installModule()

> **installModule**(`base`, `mod`): [`InstallResult`](../interfaces/InstallResult.md)

Defined in: [module.ts:120](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/builder/src/module.ts#L120)

Merge a module's contract fragment into the app document — REFUSING on any collision or unmet requirement.
On refusal `doc` is the unchanged `base` and `conflicts` explains why; nothing is partially applied.

## Parameters

### base

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### mod

[`SulukModule`](../interfaces/SulukModule.md)

## Returns

[`InstallResult`](../interfaces/InstallResult.md)
