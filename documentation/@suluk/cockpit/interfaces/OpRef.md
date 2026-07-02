[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / OpRef

# Interface: OpRef

Defined in: [cockpit/src/drift.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/cockpit/src/drift.ts#L19)

## Extended by

- [`ChangedOp`](ChangedOp.md)

## Properties

### detail

> **detail**: `string`

Defined in: [cockpit/src/drift.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/cockpit/src/drift.ts#L23)

e.g. "GET project"

***

### name

> **name**: `string`

Defined in: [cockpit/src/drift.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/cockpit/src/drift.ts#L21)

human display handle (the C009 name); disambiguated by `detail` when names repeat across paths
