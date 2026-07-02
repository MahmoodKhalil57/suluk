[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / buildPackageJson

# Function: buildPackageJson()

> **buildPackageJson**(`name`, `services`, `catalog?`, `local?`): `string`

Defined in: [plan.ts:539](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/platform/src/plan.ts#L539)

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
