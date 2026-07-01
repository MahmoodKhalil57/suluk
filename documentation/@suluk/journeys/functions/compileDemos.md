[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / compileDemos

# Function: compileDemos()

> **compileDemos**(`doc`, `vocab`, `features`, `opts?`): [`DemoScenario`](../interfaces/DemoScenario.md)[]

Defined in: [journeys/src/demos.ts:102](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/journeys/src/demos.ts#L102)

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
