[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / ChangedOp

# Interface: ChangedOp

Defined in: [cockpit/src/drift.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/cockpit/src/drift.ts#L25)

## Extends

- [`OpRef`](OpRef.md)

## Properties

### changes

> **changes**: `string`[]

Defined in: [cockpit/src/drift.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/cockpit/src/drift.ts#L27)

human-readable field-level changes, deployed→local

***

### detail

> **detail**: `string`

Defined in: [cockpit/src/drift.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/cockpit/src/drift.ts#L23)

e.g. "GET project"

#### Inherited from

[`OpRef`](OpRef.md).[`detail`](OpRef.md#detail)

***

### name

> **name**: `string`

Defined in: [cockpit/src/drift.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/cockpit/src/drift.ts#L21)

human display handle (the C009 name); disambiguated by `detail` when names repeat across paths

#### Inherited from

[`OpRef`](OpRef.md).[`name`](OpRef.md#name)
