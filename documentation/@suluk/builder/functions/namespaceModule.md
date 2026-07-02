[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / namespaceModule

# Function: namespaceModule()

> **namespaceModule**(`mod`, `prefix`): [`SulukModule`](../interfaces/SulukModule.md)

Defined in: [module.ts:208](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/builder/src/module.ts#L208)

Resolve a collision by NAMESPACING a module: prefix its OWNED entities, rewrite internal $refs that point to
them, and remap auto-CRUD cost keys accordingly. `requires` refs (e.g. User) are left untouched so the module
still composes with the host. The returned module installs cleanly alongside one that already owns the names.

## Parameters

### mod

[`SulukModule`](../interfaces/SulukModule.md)

### prefix

`string`

## Returns

[`SulukModule`](../interfaces/SulukModule.md)
