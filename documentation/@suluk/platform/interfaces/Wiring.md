[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / Wiring

# Interface: Wiring

Defined in: [wire.ts:49](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/platform/src/wire.ts#L49)

## Properties

### hooksByService

> **hooksByService**: `Record`\<`string`, `Record`\<`string`, `string`\>\>

Defined in: [wire.ts:51](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/platform/src/wire.ts#L51)

producer service id → { hookOptKey → rendered closure } — injected into that service's mount opts by `buildEntry`.

***

### imports

> **imports**: [`WireImport`](WireImport.md)[]

Defined in: [wire.ts:53](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/platform/src/wire.ts#L53)

the imports every consumed capability needs, de-duped (in first-seen order).

***

### pruned

> **pruned**: `string`[]

Defined in: [wire.ts:55](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/platform/src/wire.ts#L55)

OPTIONAL edges skipped because an endpoint service wasn't selected — so ONE full config is valid across subsets.
