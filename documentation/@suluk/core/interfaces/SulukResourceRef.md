[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / SulukResourceRef

# Interface: SulukResourceRef

Defined in: [types.ts:95](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/core/src/types.ts#L95)

A by-name reference to a loadable resource within the same `x-suluk-resources` catalog (C036; resolved at projection, never by the matcher; mirrors SulukAgentRef).

## Properties

### ref

> **ref**: `string`

Defined in: [types.ts:97](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/core/src/types.ts#L97)

a by-name `$ref` like `#/x-suluk-resources/<key>` (never an inline resource).
