[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / resolveWiring

# Function: resolveWiring()

> **resolveWiring**(`services`, `wires`, `catalog`): [`Wiring`](../interfaces/Wiring.md)

Defined in: [wire.ts:63](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/platform/src/wire.ts#L63)

Validate + compile the wires into per-producer hook fields + the imports they need.

## Parameters

### services

`string`[]

### wires

[`WireDecl`](../interfaces/WireDecl.md)[]

### catalog

`Record`\<`string`, [`Service`](../interfaces/Service.md)\>

## Returns

[`Wiring`](../interfaces/Wiring.md)
