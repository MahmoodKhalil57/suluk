[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / installModule

# Function: installModule()

> **installModule**(`base`, `mod`): [`InstallResult`](../interfaces/InstallResult.md)

Defined in: [builder/src/module.ts:120](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/builder/src/module.ts#L120)

Merge a module's contract fragment into the app document — REFUSING on any collision or unmet requirement.
On refusal `doc` is the unchanged `base` and `conflicts` explains why; nothing is partially applied.

## Parameters

### base

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### mod

[`SulukModule`](../interfaces/SulukModule.md)

## Returns

[`InstallResult`](../interfaces/InstallResult.md)
