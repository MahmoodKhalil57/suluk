[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / emitRunnableSuite

# Function: emitRunnableSuite()

> **emitRunnableSuite**(`doc`, `vocab`, `features`, `opts?`): `string`

Defined in: [journeys/src/emit.ts:69](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/journeys/src/emit.ts#L69)

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
