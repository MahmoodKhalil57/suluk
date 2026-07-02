[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / OpRef

# Interface: OpRef

Defined in: [cockpit/src/drift.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/cockpit/src/drift.ts#L19)

## Extended by

- [`ChangedOp`](ChangedOp.md)

## Properties

### detail

> **detail**: `string`

Defined in: [cockpit/src/drift.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/cockpit/src/drift.ts#L23)

e.g. "GET project"

***

### name

> **name**: `string`

Defined in: [cockpit/src/drift.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/cockpit/src/drift.ts#L21)

human display handle (the C009 name); disambiguated by `detail` when names repeat across paths
