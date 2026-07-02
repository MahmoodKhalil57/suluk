[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / SulukResourceRef

# Interface: SulukResourceRef

Defined in: [types.ts:95](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/core/src/types.ts#L95)

A by-name reference to a loadable resource within the same `x-suluk-resources` catalog (C036; resolved at projection, never by the matcher; mirrors SulukAgentRef).

## Properties

### ref

> **ref**: `string`

Defined in: [types.ts:97](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/core/src/types.ts#L97)

a by-name `$ref` like `#/x-suluk-resources/<key>` (never an inline resource).
