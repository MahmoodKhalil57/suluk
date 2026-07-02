[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / Wiring

# Interface: Wiring

Defined in: [wire.ts:49](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/platform/src/wire.ts#L49)

## Properties

### hooksByService

> **hooksByService**: `Record`\<`string`, `Record`\<`string`, `string`\>\>

Defined in: [wire.ts:51](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/platform/src/wire.ts#L51)

producer service id → { hookOptKey → rendered closure } — injected into that service's mount opts by `buildEntry`.

***

### imports

> **imports**: [`WireImport`](WireImport.md)[]

Defined in: [wire.ts:53](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/platform/src/wire.ts#L53)

the imports every consumed capability needs, de-duped (in first-seen order).
