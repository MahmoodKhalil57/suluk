[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / buildPackageJson

# Function: buildPackageJson()

> **buildPackageJson**(`name`, `services`, `catalog?`, `local?`): `string`

Defined in: [plan.ts:535](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/platform/src/plan.ts#L535)

The framework baseline package.json — name from the manifest, the union of BASE + each service's deps (versions
 resolved: @suluk/* → "latest", ecosystem → pinned), + the toolchain devDeps + the regenerate/typecheck scripts.

## Parameters

### name

`string`

### services

`string`[]

### catalog?

`Record`\<`string`, [`Service`](../interfaces/Service.md)\> = `CORE_SERVICES`

### local?

`boolean` = `false`

## Returns

`string`
