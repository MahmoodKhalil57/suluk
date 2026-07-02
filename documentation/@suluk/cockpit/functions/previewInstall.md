[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / previewInstall

# Function: previewInstall()

> **previewInstall**(`base`, `mod`): [`InstallPreview`](../interfaces/InstallPreview.md)

Defined in: [builder/src/module.ts:328](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/builder/src/module.ts#L328)

Preview an install WITHOUT committing — what it adds, what it requires, any conflicts, and its grade.

## Parameters

### base

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### mod

[`SulukModule`](../interfaces/SulukModule.md)

## Returns

[`InstallPreview`](../interfaces/InstallPreview.md)
