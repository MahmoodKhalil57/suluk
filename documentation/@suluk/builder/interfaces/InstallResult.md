[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / InstallResult

# Interface: InstallResult

Defined in: [module.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/builder/src/module.ts#L44)

## Properties

### added

> **added**: `object`

Defined in: [module.ts:49](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/builder/src/module.ts#L49)

#### operations

> **operations**: `string`[]

#### schemas

> **schemas**: `string`[]

***

### conflicts

> **conflicts**: `string`[]

Defined in: [module.ts:48](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/builder/src/module.ts#L48)

Collision / requirement errors; non-empty ⇒ the install was REFUSED.

***

### doc

> **doc**: [`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

Defined in: [module.ts:46](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/builder/src/module.ts#L46)

The merged document (UNCHANGED from `base` when installed === false).

***

### installed

> **installed**: `boolean`

Defined in: [module.ts:50](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/builder/src/module.ts#L50)
