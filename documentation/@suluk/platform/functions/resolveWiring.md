[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / resolveWiring

# Function: resolveWiring()

> **resolveWiring**(`services`, `wires`, `catalog`): [`Wiring`](../interfaces/Wiring.md)

Defined in: [wire.ts:65](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/platform/src/wire.ts#L65)

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
