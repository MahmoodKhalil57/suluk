[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / WireDecl

# Interface: WireDecl

Defined in: [manifest.ts:48](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/platform/src/manifest.ts#L48)

An inter-service composition EDGE (Phase 3). Declared here so a Phase-2 manifest's shape is forward-compatible; the
resolver ignores `wire` until the Phase-3 engine lands. `from`/`to` are `"<service>.<port|capability>"`.

## Properties

### from

> **from**: `string`

Defined in: [manifest.ts:50](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/platform/src/manifest.ts#L50)

***

### id?

> `optional` **id?**: `string`

Defined in: [manifest.ts:49](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/platform/src/manifest.ts#L49)

***

### to

> **to**: `string`

Defined in: [manifest.ts:51](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/platform/src/manifest.ts#L51)

***

### with?

> `optional` **with?**: `Record`\<`string`, `unknown`\>

Defined in: [manifest.ts:52](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/platform/src/manifest.ts#L52)
