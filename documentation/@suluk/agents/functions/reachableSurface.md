[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / reachableSurface

# Function: reachableSurface()

> **reachableSurface**(`doc`, `agentName`): `object`

Defined in: [agents/src/conformance.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/agents/src/conformance.ts#L27)

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
