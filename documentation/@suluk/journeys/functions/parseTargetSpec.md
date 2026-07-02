[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / parseTargetSpec

# Function: parseTargetSpec()

> **parseTargetSpec**(`spec`): \{ `file`: `string`; `scenario`: `string`; `schemaVar`: `string`; \} \| `null`

Defined in: [journeys/src/cli.ts:71](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/journeys/src/cli.ts#L71)

Parse `"<scenario>=<file>#<schemaVar>"`. The scenario may contain spaces/`=` only before the FIRST `=`.

## Parameters

### spec

`string`

## Returns

\{ `file`: `string`; `scenario`: `string`; `schemaVar`: `string`; \} \| `null`
