[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / emitRunnableSuite

# Function: emitRunnableSuite()

> **emitRunnableSuite**(`doc`, `vocab`, `features`, `opts?`): `string`

Defined in: [journeys/src/emit.ts:69](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/journeys/src/emit.ts#L69)

Emit a runnable bun:test suite (a string) from a parsed, bound feature set, lowered to the real SDK client.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### vocab

[`Vocabulary`](../interfaces/Vocabulary.md)

### features

[`Feature`](../interfaces/Feature.md)[]

### opts?

[`EmitOptions`](../interfaces/EmitOptions.md) = `{}`

## Returns

`string`
