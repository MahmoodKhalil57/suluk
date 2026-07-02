[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / renderScenarioOutlines

# Function: renderScenarioOutlines()

> **renderScenarioOutlines**(`doc`, `opts?`): `string`

Defined in: [journeys/src/outline.ts:90](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/journeys/src/outline.ts#L90)

Render the generated outlines as a `.feature` SIDECAR a tester expands. A column-bearing op becomes a `Scenario
Outline:` + a one-row `Examples:` table; a body-less op becomes a plain `Scenario:`.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### opts?

[`OutlineRenderOptions`](../interfaces/OutlineRenderOptions.md) = `{}`

## Returns

`string`
