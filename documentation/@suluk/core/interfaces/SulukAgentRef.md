[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / SulukAgentRef

# Interface: SulukAgentRef

Defined in: [types.ts:202](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/core/src/types.ts#L202)

A by-name reference to a sub-agent within the same `x-suluk-agents` map (C009/C013; resolved at projection time, never by the matcher).

## Properties

### ref

> **ref**: `string`

Defined in: [types.ts:204](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/core/src/types.ts#L204)

a by-name `$ref` like `#/x-suluk-agents/<key>` (never an inline agent).
