[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / SulukResourceRef

# Interface: SulukResourceRef

Defined in: [types.ts:95](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/core/src/types.ts#L95)

A by-name reference to a loadable resource within the same `x-suluk-resources` catalog (C036; resolved at projection, never by the matcher; mirrors SulukAgentRef).

## Properties

### ref

> **ref**: `string`

Defined in: [types.ts:97](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/core/src/types.ts#L97)

a by-name `$ref` like `#/x-suluk-resources/<key>` (never an inline resource).
