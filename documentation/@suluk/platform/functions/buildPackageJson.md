[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / buildPackageJson

# Function: buildPackageJson()

> **buildPackageJson**(`name`, `services`, `catalog?`, `local?`): `string`

Defined in: [plan.ts:524](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/platform/src/plan.ts#L524)

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
