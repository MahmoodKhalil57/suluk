[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / resolveWiring

# Function: resolveWiring()

> **resolveWiring**(`services`, `wires`, `catalog`): [`Wiring`](../interfaces/Wiring.md)

Defined in: [wire.ts:63](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/platform/src/wire.ts#L63)

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
