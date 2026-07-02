[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / reachableSurface

# Function: reachableSurface()

> **reachableSurface**(`doc`, `agentName`): `object`

Defined in: [agents/src/conformance.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/agents/src/conformance.ts#L27)

The statically-enumerable reachable surface of an agent: its own route keys (the wire ids) + every route key of
every transitively-reachable sub-agent. Worst-case authz reach, computed with ZERO requests. (Cycle-safe.)

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### agentName

`string`

## Returns

`object`

### agents

> **agents**: `string`[]

### tools

> **tools**: `string`[]
