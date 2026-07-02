[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / resolveSourced

# Function: resolveSourced()

> **resolveSourced**(`captured`, `ref`): `unknown`

Defined in: [examples/src/index.ts:121](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/examples/src/index.ts#L121)

Resolve a `sourced` field's value from a scenario-scoped bag of captured operation results (keyed by `op.name`). The
shared primitive both the journeys emitter (carried-data across a journey) and an sdk chaining helper use. Pure.

## Parameters

### captured

`Record`\<`string`, `unknown`\>

### ref

[`SourceRef`](../interfaces/SourceRef.md)

## Returns

`unknown`
