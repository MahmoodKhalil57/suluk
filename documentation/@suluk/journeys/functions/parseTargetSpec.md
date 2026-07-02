[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / parseTargetSpec

# Function: parseTargetSpec()

> **parseTargetSpec**(`spec`): \{ `file`: `string`; `scenario`: `string`; `schemaVar`: `string`; \} \| `null`

Defined in: [journeys/src/cli.ts:71](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/journeys/src/cli.ts#L71)

Parse `"<scenario>=<file>#<schemaVar>"`. The scenario may contain spaces/`=` only before the FIRST `=`.

## Parameters

### spec

`string`

## Returns

\{ `file`: `string`; `scenario`: `string`; `schemaVar`: `string`; \} \| `null`
