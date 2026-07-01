[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / OpRef

# Interface: OpRef

Defined in: [cockpit/src/drift.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/cockpit/src/drift.ts#L19)

## Extended by

- [`ChangedOp`](ChangedOp.md)

## Properties

### detail

> **detail**: `string`

Defined in: [cockpit/src/drift.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/cockpit/src/drift.ts#L23)

e.g. "GET project"

***

### name

> **name**: `string`

Defined in: [cockpit/src/drift.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/cockpit/src/drift.ts#L21)

human display handle (the C009 name); disambiguated by `detail` when names repeat across paths
