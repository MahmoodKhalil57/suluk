[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / WireDecl

# Interface: WireDecl

Defined in: [manifest.ts:53](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/platform/src/manifest.ts#L53)

An inter-service composition EDGE (Phase 3). Declared here so a Phase-2 manifest's shape is forward-compatible; the
resolver ignores `wire` until the Phase-3 engine lands. `from`/`to` are `"<service>.<port|capability>"`.

## Properties

### from

> **from**: `string`

Defined in: [manifest.ts:55](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/platform/src/manifest.ts#L55)

***

### id?

> `optional` **id?**: `string`

Defined in: [manifest.ts:54](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/platform/src/manifest.ts#L54)

***

### to

> **to**: `string`

Defined in: [manifest.ts:56](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/platform/src/manifest.ts#L56)

***

### with?

> `optional` **with?**: `Record`\<`string`, `unknown`\>

Defined in: [manifest.ts:57](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/platform/src/manifest.ts#L57)
