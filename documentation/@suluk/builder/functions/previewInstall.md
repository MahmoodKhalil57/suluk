[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / previewInstall

# Function: previewInstall()

> **previewInstall**(`base`, `mod`): [`InstallPreview`](../interfaces/InstallPreview.md)

Defined in: [module.ts:328](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/builder/src/module.ts#L328)

Preview an install WITHOUT committing — what it adds, what it requires, any conflicts, and its grade.

## Parameters

### base

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### mod

[`SulukModule`](../interfaces/SulukModule.md)

## Returns

[`InstallPreview`](../interfaces/InstallPreview.md)
