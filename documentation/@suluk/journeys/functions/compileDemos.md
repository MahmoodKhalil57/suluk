[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / compileDemos

# Function: compileDemos()

> **compileDemos**(`doc`, `vocab`, `features`, `opts?`): [`DemoScenario`](../interfaces/DemoScenario.md)[]

Defined in: [journeys/src/demos.ts:102](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/journeys/src/demos.ts#L102)

Compile a bound feature set into the demo IR: ordered requests per scenario, with sourced fields wired to captures.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### vocab

[`Vocabulary`](../interfaces/Vocabulary.md)

### features

[`Feature`](../interfaces/Feature.md)[]

### opts?

[`CompileDemoOptions`](../interfaces/CompileDemoOptions.md) = `{}`

## Returns

[`DemoScenario`](../interfaces/DemoScenario.md)[]
