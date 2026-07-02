[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / parseTargetSpec

# Function: parseTargetSpec()

> **parseTargetSpec**(`spec`): \{ `file`: `string`; `scenario`: `string`; `schemaVar`: `string`; \} \| `null`

Defined in: [journeys/src/cli.ts:71](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/journeys/src/cli.ts#L71)

Parse `"<scenario>=<file>#<schemaVar>"`. The scenario may contain spaces/`=` only before the FIRST `=`.

## Parameters

### spec

`string`

## Returns

\{ `file`: `string`; `scenario`: `string`; `schemaVar`: `string`; \} \| `null`
