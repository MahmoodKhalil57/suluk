[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / emitRunnableSuite

# Function: emitRunnableSuite()

> **emitRunnableSuite**(`doc`, `vocab`, `features`, `opts?`): `string`

Defined in: [journeys/src/emit.ts:69](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/journeys/src/emit.ts#L69)

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
