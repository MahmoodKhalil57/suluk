[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / namespaceModule

# Function: namespaceModule()

> **namespaceModule**(`mod`, `prefix`): [`SulukModule`](../interfaces/SulukModule.md)

Defined in: [builder/src/module.ts:208](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/builder/src/module.ts#L208)

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
