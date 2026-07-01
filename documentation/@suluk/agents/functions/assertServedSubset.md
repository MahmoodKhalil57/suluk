[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / assertServedSubset

# Function: assertServedSubset()

> **assertServedSubset**(`doc`, `agentName`, `servedToolNames`): [`ConformanceFinding`](../interfaces/ConformanceFinding.md)[]

Defined in: [agents/src/conformance.ts:47](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/agents/src/conformance.ts#L47)

OVER-SERVE auditor: assert the tools a server actually exposes are a SUBSET of the declared reachable surface.
Any served tool NOT in the surface is a WIDENING — the contract is no longer the source of truth for authz reach.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### agentName

`string`

### servedToolNames

`string`[]

## Returns

[`ConformanceFinding`](../interfaces/ConformanceFinding.md)[]
