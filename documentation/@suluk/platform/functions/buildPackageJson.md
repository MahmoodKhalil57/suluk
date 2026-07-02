[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / buildPackageJson

# Function: buildPackageJson()

> **buildPackageJson**(`name`, `services`, `catalog?`, `local?`): `string`

Defined in: [plan.ts:571](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/platform/src/plan.ts#L571)

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
