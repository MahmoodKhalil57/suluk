[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / SourceRef

# Interface: SourceRef

Defined in: [examples/src/index.ts:57](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/examples/src/index.ts#L57)

A machine-wireable source edge for a `sourced` field: pull `select` (default "id") from operation `op`'s response.

## Properties

### op

> **op**: `string`

Defined in: [examples/src/index.ts:59](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/examples/src/index.ts#L59)

the source operation's v4 by-name handle (C009 identity: `op.name`).

***

### select?

> `optional` **select?**: `string`

Defined in: [examples/src/index.ts:61](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/examples/src/index.ts#L61)

a dotted path into the source op's RESPONSE to pull (default "id").
