[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / resolveWiring

# Function: resolveWiring()

> **resolveWiring**(`services`, `wires`, `catalog`): [`Wiring`](../interfaces/Wiring.md)

Defined in: [wire.ts:63](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/platform/src/wire.ts#L63)

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
